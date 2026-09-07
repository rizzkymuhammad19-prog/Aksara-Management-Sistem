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

  const [settings, employee] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "default" } }),
    prisma.employee.findUnique({ where: { id: session.user.employeeId }, include: { assignedLocation: true } }),
  ]);

  // If this employee is assigned to a specific office, only that one counts.
  // Otherwise, any active location works.
  const candidateLocations = employee?.assignedLocation
    ? [employee.assignedLocation]
    : await prisma.attendanceLocation.findMany({ where: { isActive: true } });

  if (candidateLocations.length === 0) {
    return NextResponse.json({ error: "Lokasi kantor belum diatur oleh Direktur." }, { status: 400 });
  }

  let matched: { id: string; name: string } | null = null;
  let nearestDistance = Infinity;

  for (const loc of candidateLocations) {
    const distance = distanceMeters(latitude, longitude, loc.latitude, loc.longitude);
    if (distance < nearestDistance) nearestDistance = distance;
    if (distance <= loc.radiusM) {
      matched = { id: loc.id, name: loc.name };
      break;
    }
  }

  if (!matched) {
    const scope = employee?.assignedLocation ? `di ${employee.assignedLocation.name}` : "di semua lokasi kantor";
    return NextResponse.json(
      { error: `Anda berada di luar radius ${scope} (jarak terdekat ${Math.round(nearestDistance)}m).` },
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
