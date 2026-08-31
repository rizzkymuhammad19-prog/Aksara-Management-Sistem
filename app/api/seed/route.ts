import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role, AttendanceStatus, DesignStatus, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DIVISIONS = [
  { name: "Aksara Kreatif Visual", slug: "akv" },
  { name: "Sayur Express", slug: "sayur-express" },
  { name: "Ruang Berita", slug: "ruang-berita" },
  { name: "Komputer", slug: "komputer" },
  { name: "Website Development", slug: "website-development" },
];

const EMPLOYEE_NAMES = [
  "Andi Pratama", "Budi Santoso", "Citra Dewi", "Dian Permata", "Eka Putra",
  "Fitri Handayani", "Gilang Ramadhan", "Hesti Wulandari", "Indra Kusuma", "Joko Susilo",
  "Kartika Sari", "Lukman Hakim", "Maya Anggraini", "Nanda Saputra", "Oki Firmansyah",
];

// Simple shared-secret guard so this isn't wide open. Change this string any time
// by also updating the SEED_KEY env var in Vercel (optional — a hardcoded fallback
// is provided so it works out of the box for initial setup).
const SEED_KEY = process.env.SEED_KEY || "aksara-seed-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "Unauthorized. Add ?key=... to the URL." }, { status: 401 });
  }

  try {
    const divisions = [];
    for (const d of DIVISIONS) {
      const div = await prisma.division.upsert({ where: { slug: d.slug }, update: {}, create: d });
      divisions.push(div);
    }

    const passwordHash = await bcrypt.hash("password123", 10);

    await prisma.user.upsert({
      where: { email: "direktur@aksara.com" },
      update: {},
      create: {
        name: "Rizky Muhammad",
        email: "direktur@aksara.com",
        passwordHash,
        role: Role.DIRECTOR,
        phone: "081200000000",
      },
    });

    const employees = [];
    for (let i = 0; i < EMPLOYEE_NAMES.length; i++) {
      const division = divisions[i % divisions.length];
      const email = `${EMPLOYEE_NAMES[i].toLowerCase().replace(/\s+/g, ".")}@aksara.com`;
      const isDesigner = division.slug === "akv" || i % 4 === 0;

      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name: EMPLOYEE_NAMES[i],
          email,
          passwordHash,
          role: i === 0 ? Role.ADMIN : Role.EMPLOYEE,
          phone: `0812${String(10000000 + i).slice(0, 8)}`,
        },
      });

      const employee = await prisma.employee.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          divisionId: division.id,
          position: isDesigner ? "Designer" : "Staff",
          isDesigner,
        },
      });
      employees.push(employee);
    }

    const expenseCategories = ["Gaji", "Operasional", "Transportasi", "Internet", "Listrik", "Sewa", "Marketing", "Peralatan", "Software", "Produksi", "Lainnya"];
    const categoryRecords = [];
    for (const name of expenseCategories) {
      const cat = await prisma.financialCategory.upsert({
        where: { id: `seed-${name}` },
        update: {},
        create: { id: `seed-${name}`, name, type: TransactionType.EXPENSE },
      });
      categoryRecords.push(cat);
    }

    const now = new Date();
    for (const div of divisions) {
      const existingIncome = await prisma.incomeTransaction.count({ where: { divisionId: div.id } });
      if (existingIncome > 0) continue; // avoid duplicating on repeated seed calls

      for (let i = 0; i < 6; i++) {
        const day = new Date(now.getFullYear(), now.getMonth(), 2 + i * 4);
        await prisma.incomeTransaction.create({
          data: {
            divisionId: div.id,
            date: day,
            source: "Penjualan / Jasa",
            description: `Pemasukan ${div.name} #${i + 1}`,
            amount: 2_000_000 + Math.random() * 8_000_000,
            paymentMethod: "Transfer Bank",
            createdById: employees[0].id,
          },
        });
        await prisma.expenseTransaction.create({
          data: {
            divisionId: div.id,
            categoryId: categoryRecords[i % categoryRecords.length].id,
            date: day,
            description: `Pengeluaran ${div.name} #${i + 1}`,
            amount: 800_000 + Math.random() * 3_000_000,
            paymentMethod: "Cash",
            createdById: employees[0].id,
          },
        });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const statuses = [AttendanceStatus.HADIR, AttendanceStatus.HADIR, AttendanceStatus.HADIR, AttendanceStatus.TERLAMBAT, AttendanceStatus.IZIN, AttendanceStatus.SAKIT];
    for (let i = 0; i < employees.length; i++) {
      if (i % 5 === 4) continue;
      const status = statuses[i % statuses.length];
      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId: employees[i].id, date: today } },
        update: {},
        create: {
          employeeId: employees[i].id,
          date: today,
          status,
          checkInAt: status !== AttendanceStatus.IZIN && status !== AttendanceStatus.SAKIT ? new Date() : null,
        },
      });
    }

    const designTypes = ["Poster", "Feed Instagram", "Story", "Banner", "Logo", "Thumbnail"];
    const designers = employees.filter((e) => e.isDesigner);
    for (const designer of designers) {
      const existingDesigns = await prisma.designTask.count({ where: { designerId: designer.id } });
      if (existingDesigns > 0) continue;

      for (let i = 0; i < 5; i++) {
        await prisma.designTask.create({
          data: {
            divisionId: designer.divisionId,
            designerId: designer.id,
            date: new Date(now.getFullYear(), now.getMonth(), 3 + i * 3),
            projectName: `Project ${designer.id.slice(-4)}-${i}`,
            designType: designTypes[i % designTypes.length],
            status: i % 4 === 0 ? DesignStatus.DRAFT : DesignStatus.APPROVED,
          },
        });
      }
    }

    await prisma.setting.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        companyName: "Aksara",
        officeAddress: "Kantor Pusat Aksara",
        radiusM: 100,
        clockInTime: "08:00",
        clockOutTime: "17:00",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Seed selesai. Login: direktur@aksara.com / password123",
      divisions: divisions.length,
      employees: employees.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
