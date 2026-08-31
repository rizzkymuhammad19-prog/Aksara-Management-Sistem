import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { distanceMeters } from "@/lib/geo";

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
  });
  if (existing?.checkInAt) {
    return NextResponse.json({ error: "Anda sudah absen masuk hari ini." }, { status: 400 });
  }

  // Determine Hadir vs Terlambat based on configured clock-in time
  const now = new Date();
  const [clockH, clockM] = (settings.clockInTime || "08:00").split(":").map(Number);
  const deadline = new Date(now);
  deadline.setHours(clockH, clockM, 0, 0);
  const status = now <= deadline ? "HADIR" : "TERLAMBAT";

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
