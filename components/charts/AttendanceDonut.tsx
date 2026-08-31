"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Hadir: "#0FA98A",
  Terlambat: "#F5A623",
  Izin: "#3B5BFF",
  Sakit: "#64748B",
  "Tidak Hadir": "#F43F5E",
};

export default function AttendanceDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="card">
      <p className="font-display font-medium text-text mb-4">Status Kehadiran Hari Ini</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={STATUS_COLORS[entry.name] ?? "#94A3B8"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
