import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  signature = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  signature?: boolean;
}) {
  if (signature) {
    return (
      <div className="card-signature">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
            <p className="font-mono text-2xl font-bold tabular-nums mt-1.5 truncate">{value}</p>
            {trend && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold mt-2 px-2 py-0.5 rounded-full ${trend.positive ? "bg-gain/20 text-gain" : "bg-loss/20 text-loss"}`}>
                {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend.value}
              </span>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-accent shrink-0">
            <Icon size={20} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
          <p className="font-mono text-2xl font-bold tabular-nums text-text mt-1.5 truncate">{value}</p>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold mt-2 px-2 py-0.5 rounded-full ${trend.positive ? "bg-gain-light text-gain" : "bg-loss-light text-loss"}`}>
              {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.value}
            </span>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
