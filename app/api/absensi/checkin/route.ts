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

  const [settings, locations] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "default" } }),
    prisma.attendanceLocation.findMany({ where: { isActive: true } }),
  ]);

  if (locations.length === 0) {
    return NextResponse.json({ error: "Lokasi kantor belum diatur oleh Direktur." }, { status: 400 });
  }

  // Check distance against every active office location — allowed if within radius of ANY of them
  let matched: { id: string; name: string } | null = null;
  let nearestDistance = Infinity;

  for (const loc of locations) {
    const distance = distanceMeters(latitude, longitude, loc.latitude, loc.longitude);
    if (distance < nearestDistance) nearestDistance = distance;
    if (distance <= loc.radiusM) {
      matched = { id: loc.id, name: loc.name };
      break;
    }
  }

  if (!matched) {
    return NextResponse.json(
      { error: `Anda berada di luar radius semua lokasi kantor (jarak terdekat ${Math.round(nearestDistance)}m).` },
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

  const now = new Date();
  const status = isBeforeJakartaDeadline(settings?.clockInTime || "08:00") ? "HADIR" : "TERLAMBAT";

  const attendance = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
    update: { checkInAt: now, checkInLat: latitude, checkInLng: longitude, status, locationId: matched.id },
    create: {
      employeeId: session.user.employeeId,
      date: today,
      checkInAt: now,
      checkInLat: latitude,
      checkInLng: longitude,
      status,
      locationId: matched.id,
    },
  });

  return NextResponse.json({ success: true, status: attendance.status, locationName: matched.name });
}
