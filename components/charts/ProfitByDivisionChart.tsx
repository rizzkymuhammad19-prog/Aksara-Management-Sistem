"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#2563EB", "#1E3A8A", "#60A5FA", "#93C5FD", "#3B82F6"];

export default function ProfitByDivisionChart({ data }: { data: { division: string; laba: number }[] }) {
  return (
    <div className="card">
      <p className="font-semibold text-text mb-4">Laba per Divisi</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FF" />
          <XAxis dataKey="division" tick={{ fontSize: 11, fill: "#64748B" }} />
          <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
          <Tooltip />
          <Bar dataKey="laba" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
