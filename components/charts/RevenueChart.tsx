"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { period: string; pendapatan: number; pengeluaran: number; laba: number }[];
}) {
  return (
    <div className="card">
      <p className="font-semibold text-text mb-4">Pendapatan vs Pengeluaran</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FF" />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748B" }} />
          <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pendapatan" stroke="#2563EB" strokeWidth={2} name="Pendapatan" />
          <Line type="monotone" dataKey="pengeluaran" stroke="#DC2626" strokeWidth={2} name="Pengeluaran" />
          <Line type="monotone" dataKey="laba" stroke="#16A34A" strokeWidth={2} name="Laba" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
