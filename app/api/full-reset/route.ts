import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const maxDuration = 30;

const prisma = new PrismaClient();

const RESET_KEY = process.env.SEED_KEY || "aksara-seed-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== RESET_KEY) {
    return NextResponse.json({ error: "Unauthorized. Add ?key=... to the URL." }, { status: 401 });
  }

  try {
    await prisma.$transaction([
      // Anything that references Employee or Division must go first.
      prisma.incomeTransaction.deleteMany({}),
      prisma.expenseTransaction.deleteMany({}),
      prisma.attendance.deleteMany({}),
      prisma.designFile.deleteMany({}),
      prisma.designTask.deleteMany({}),
      prisma.taskComment.deleteMany({}),
      prisma.task.deleteMany({}),
      prisma.employeeTarget.deleteMany({}),
      prisma.employeePerformance.deleteMany({}),
      prisma.notification.deleteMany({}),
      prisma.auditLog.deleteMany({}),

      // Now safe to remove employees and divisions.
      prisma.employee.deleteMany({}),
      prisma.division.deleteMany({}),

      // Remove every user account except the Director, so login still works.
      prisma.user.deleteMany({ where: { role: { not: "DIRECTOR" } } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Semua divisi, karyawan, dan akun demo sudah dihapus. Akun Direktur (direktur@aksara.com) tetap bisa login untuk mulai input data dari nol.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
