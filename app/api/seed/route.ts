import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role, AttendanceStatus, DesignStatus, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

// Allow this route up to 60s to run (default serverless limit is 10s, which is too
// short for seeding this much demo data in one go).
export const maxDuration = 60;

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

const SEED_KEY = process.env.SEED_KEY || "aksara-seed-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== SEED_KEY) {
    return NextResponse.json({ error: "Unauthorized. Add ?key=... to the URL." }, { status: 401 });
  }

  try {
    // 1. Divisions (in parallel)
    const divisions = await Promise.all(
      DIVISIONS.map((d) => prisma.division.upsert({ where: { slug: d.slug }, update: {}, create: d }))
    );

    const passwordHash = await bcrypt.hash("password123", 10);

    // 2. Director
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

    // 3. Employees + users (in parallel)
    const employees = await Promise.all(
      EMPLOYEE_NAMES.map(async (name, i) => {
        const division = divisions[i % divisions.length];
        const email = `${name.toLowerCase().replace(/\s+/g, ".")}@aksara.com`;
        const isDesigner = division.slug === "akv" || i % 4 === 0;

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            name,
            email,
            passwordHash,
            role: i === 0 ? Role.ADMIN : Role.EMPLOYEE,
            phone: `0812${String(10000000 + i).slice(0, 8)}`,
          },
        });

        return prisma.employee.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            divisionId: division.id,
            position: isDesigner ? "Designer" : "Staff",
            isDesigner,
          },
        });
      })
    );

    // 4. Financial categories (in parallel)
    const expenseCategories = ["Gaji", "Operasional", "Transportasi", "Internet", "Listrik", "Sewa", "Marketing", "Peralatan", "Software", "Produksi", "Lainnya"];
    const categoryRecords = await Promise.all(
      expenseCategories.map((name) =>
        prisma.financialCategory.upsert({
          where: { id: `seed-${name}` },
          update: {},
          create: { id: `seed-${name}`, name, type: TransactionType.EXPENSE },
        })
      )
    );

    // 5. Income & expense — batched with createMany (single query per division instead of 12 sequential creates)
    const now = new Date();
    for (const div of divisions) {
      const existingIncome = await prisma.incomeTransaction.count({ where: { divisionId: div.id } });
      if (existingIncome > 0) continue;

      const incomeRows = Array.from({ length: 6 }).map((_, i) => ({
        divisionId: div.id,
        date: new Date(now.getFullYear(), now.getMonth(), 2 + i * 4),
        source: "Penjualan / Jasa",
        description: `Pemasukan ${div.name} #${i + 1}`,
        amount: 2_000_000 + Math.random() * 8_000_000,
        paymentMethod: "Transfer Bank",
        createdById: employees[0].id,
      }));
      const expenseRows = Array.from({ length: 6 }).map((_, i) => ({
        divisionId: div.id,
        categoryId: categoryRecords[i % categoryRecords.length].id,
        date: new Date(now.getFullYear(), now.getMonth(), 2 + i * 4),
        description: `Pengeluaran ${div.name} #${i + 1}`,
        amount: 800_000 + Math.random() * 3_000_000,
        paymentMethod: "Cash",
        createdById: employees[0].id,
      }));

      await Promise.all([
        prisma.incomeTransaction.createMany({ data: incomeRows }),
        prisma.expenseTransaction.createMany({ data: expenseRows }),
      ]);
    }

    // 6. Attendance (batched)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const statuses = [AttendanceStatus.HADIR, AttendanceStatus.HADIR, AttendanceStatus.HADIR, AttendanceStatus.TERLAMBAT, AttendanceStatus.IZIN, AttendanceStatus.SAKIT];

    await Promise.all(
      employees.map((emp, i) => {
        if (i % 5 === 4) return null;
        const status = statuses[i % statuses.length];
        return prisma.attendance.upsert({
          where: { employeeId_date: { employeeId: emp.id, date: today } },
          update: {},
          create: {
            employeeId: emp.id,
            date: today,
            status,
            checkInAt: status !== AttendanceStatus.IZIN && status !== AttendanceStatus.SAKIT ? new Date() : null,
          },
        });
      })
    );

    // 7. Design tasks (batched per designer)
    const designTypes = ["Poster", "Feed Instagram", "Story", "Banner", "Logo", "Thumbnail"];
    const designers = employees.filter((e) => e.isDesigner);

    await Promise.all(
      designers.map(async (designer) => {
        const existingDesigns = await prisma.designTask.count({ where: { designerId: designer.id } });
        if (existingDesigns > 0) return;

        const rows = Array.from({ length: 5 }).map((_, i) => ({
          divisionId: designer.divisionId,
          designerId: designer.id,
          date: new Date(now.getFullYear(), now.getMonth(), 3 + i * 3),
          projectName: `Project ${designer.id.slice(-4)}-${i}`,
          designType: designTypes[i % designTypes.length],
          status: i % 4 === 0 ? DesignStatus.DRAFT : DesignStatus.APPROVED,
        }));
        await prisma.designTask.createMany({ data: rows });
      })
    );

    // 8. Settings
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
