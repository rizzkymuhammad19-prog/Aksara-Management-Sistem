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
          <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#737373" }} />
          <YAxis tick={{ fontSize: 12, fill: "#737373" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pendapatan" stroke="#0A0A0A" strokeWidth={2.5} name="Pendapatan" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="pengeluaran" stroke="#C6314B" strokeWidth={2} strokeDasharray="4 3" name="Pengeluaran" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="laba" stroke="#0F9D6B" strokeWidth={2.5} name="Laba" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
