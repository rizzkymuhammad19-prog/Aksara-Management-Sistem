import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { divisionId, clientName, clientAddress, date, dueDate, notes, items } = body;

  if (!divisionId || !clientName || !date || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  let employeeId = session.user.employeeId;
  if (!employeeId) {
    const anyEmployee = await prisma.employee.findFirst();
    employeeId = anyEmployee?.id ?? null;
  }
  if (!employeeId) {
    return NextResponse.json({ error: "Tidak ada data karyawan untuk mencatat invoice ini." }, { status: 400 });
  }

  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      divisionId,
      clientName,
      clientAddress: clientAddress || null,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || null,
      createdById: employeeId,
      items: {
        create: items.map((it: any) => ({
          name: it.name,
          unit: it.unit,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      },
    },
  });

  return NextResponse.json({ success: true, id: invoice.id, invoiceNumber });
}
