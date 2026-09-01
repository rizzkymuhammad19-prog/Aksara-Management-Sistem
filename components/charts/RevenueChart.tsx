"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { period: string; pendapatan: number; pengeluaran: number; laba: number }[];
}) {
  return (
    <div className="card">
      <p className="font-display font-medium text-text mb-4">Pendapatan vs Pengeluaran</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748B" }} />
          <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pendapatan" stroke="#3B63FF" strokeWidth={2.5} name="Pendapatan" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="pengeluaran" stroke="#FF3B5C" strokeWidth={2.5} name="Pengeluaran" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="laba" stroke="#00C896" strokeWidth={2.5} name="Laba" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
