"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function DivisionFilter({ divisions }: { divisions: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("divisionId", e.target.value);
    } else {
      params.delete("divisionId");
    }
    router.push(`/laporan?${params.toString()}`);
  }

  return (
    <select
      onChange={handleChange}
      defaultValue={searchParams.get("divisionId") || ""}
      className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">Semua Divisi</option>
      {divisions.map((d) => (
        <option key={d.id} value={d.id}>{d.name}</option>
      ))}
    </select>
  );
}
