import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { distanceMeters } from "@/lib/geo";
import { jakartaTodayDateOnly, isBeforeJakartaDeadline } from "@/lib/jakarta";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.employeeId) {
    return NextResponse.json({ error: "Akun ini tidak terdaftar sebagai karyawan." }, { status: 403 });
  }

  const { latitude, longitude } = await req.json();
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "Lokasi tidak valid." }, { status: 400 });
  }

  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  if (!settings?.officeLat || !settings?.officeLng) {
    return NextResponse.json({ error: "Lokasi kantor belum diatur oleh admin." }, { status: 400 });
  }

  const distance = distanceMeters(latitude, longitude, settings.officeLat, settings.officeLng);
  if (distance > settings.radiusM) {
    return NextResponse.json(
      { error: `Anda berada di luar lokasi kantor (jarak ${Math.round(distance)}m, radius diizinkan ${settings.radiusM}m).` },
      { status: 403 }
    );
  }

  const today = jakartaTodayDateOnly();

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
  });
  if (existing?.checkInAt) {
    return NextResponse.json({ error: "Anda sudah absen masuk hari ini." }, { status: 400 });
  }

  // Determine Hadir vs Terlambat based on WIB wall-clock time, not server (UTC) time
  const now = new Date();
  const status = isBeforeJakartaDeadline(settings.clockInTime || "08:00") ? "HADIR" : "TERLAMBAT";

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
    update: { checkInAt: now, checkInLat: latitude, checkInLng: longitude, status },
    create: {
      employeeId: session.user.employeeId,
      date: today,
      checkInAt: now,
      checkInLat: latitude,
      checkInLng: longitude,
      status,
    },
  });

  return NextResponse.json({ success: true, status: attendance.status, distance: Math.round(distance) });
}
