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
    // Delete transactional/demo data only — divisions, employees, users, settings, categories stay intact.
    await prisma.$transaction([
      prisma.incomeTransaction.deleteMany({}),
      prisma.expenseTransaction.deleteMany({}),
      prisma.attendance.deleteMany({}),
      prisma.designFile.deleteMany({}),
      prisma.designTask.deleteMany({}),
      prisma.taskComment.deleteMany({}),
      prisma.task.deleteMany({}),
      prisma.employeeTarget.deleteMany({}),
      prisma.employeePerformance.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: "Semua angka transaksi sudah direset ke 0. Divisi, karyawan, dan akun login tetap ada.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
