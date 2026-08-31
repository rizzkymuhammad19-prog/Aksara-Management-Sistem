"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#3B5BFF", "#2540C4", "#5EEAD4", "#0FA98A", "#818CF8"];

export default function ProfitByDivisionChart({ data }: { data: { division: string; laba: number }[] }) {
  return (
    <div className="card">
      <p className="font-display font-medium text-text mb-4">Laba per Divisi</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
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
