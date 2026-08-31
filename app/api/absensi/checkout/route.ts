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
      { error: `Anda berada di luar lokasi kantor (jarak ${Math.round(distance)}m).` },
      { status: 403 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
  });

  if (!existing?.checkInAt) {
    return NextResponse.json({ error: "Anda belum absen masuk hari ini." }, { status: 400 });
  }
  if (existing.checkOutAt) {
    return NextResponse.json({ error: "Anda sudah absen pulang hari ini." }, { status: 400 });
  }

  const now = new Date();
  await prisma.attendance.update({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
    data: { checkOutAt: now, checkOutLat: latitude, checkOutLng: longitude },
  });

  return NextResponse.json({ success: true });
}
