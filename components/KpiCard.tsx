import { LucideIcon } from "lucide-react";

export default function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-2xl font-semibold text-text mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.positive ? "text-success" : "text-danger"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
