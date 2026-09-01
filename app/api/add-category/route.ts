import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const KEY = process.env.SEED_KEY || "aksara-seed-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.financialCategory.findFirst({ where: { name: "Pembelian", type: "EXPENSE" } });
  if (existing) {
    return NextResponse.json({ success: true, message: "Kategori 'Pembelian' sudah ada." });
  }

  await prisma.financialCategory.create({ data: { name: "Pembelian", type: "EXPENSE" } });
  return NextResponse.json({ success: true, message: "Kategori 'Pembelian' berhasil ditambahkan." });
}
