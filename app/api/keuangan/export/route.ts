import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPeriodRange, Period } from "@/lib/dateRange";

export async function GET(req: NextRequest) {
  const divisionId = req.nextUrl.searchParams.get("divisionId") || undefined;
  const periodParam = req.nextUrl.searchParams.get("period") || "bulanan";
  const period = (["harian", "mingguan", "bulanan"].includes(periodParam) ? periodParam : "bulanan") as Period;
  const { start, end, label } = getPeriodRange(period);

  const [incomes, expenses, division] = await Promise.all([
    prisma.incomeTransaction.findMany({
      where: { date: { gte: start, lte: end }, ...(divisionId ? { divisionId } : {}) },
      include: { division: true },
      orderBy: { date: "asc" },
    }),
    prisma.expenseTransaction.findMany({
      where: { date: { gte: start, lte: end }, ...(divisionId ? { divisionId } : {}) },
      include: { division: true, category: true },
      orderBy: { date: "asc" },
    }),
    divisionId ? prisma.division.findUnique({ where: { id: divisionId } }) : null,
  ]);

  const rows = [
    ...incomes.map((t) => ({
      tanggal: t.date.toISOString().split("T")[0],
      divisi: t.division.name,
      tipe: "Pemasukan",
      kategori: t.source,
      deskripsi: t.description || "",
      nominal: Number(t.amount),
    })),
    ...expenses.map((t) => ({
      tanggal: t.date.toISOString().split("T")[0],
      divisi: t.division.name,
      tipe: "Pengeluaran",
      kategori: t.category.name,
      deskripsi: t.description || "",
      nominal: -Number(t.amount),
    })),
  ].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);

  return NextResponse.json({
    title: division ? division.name : "Semua Divisi",
    period: label,
    rows,
    summary: { totalIncome, totalExpense, netProfit: totalIncome - totalExpense },
  });
}
