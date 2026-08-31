import { LucideIcon } from "lucide-react";

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
          <div>
            <p className="text-sm text-white/70">{label}</p>
            <p className="font-display text-2xl font-medium mt-1">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 font-medium ${trend.positive ? "text-accent" : "text-rose-300"}`}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
            <Icon size={20} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="font-display text-2xl font-medium text-text mt-1">{value}</p>
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
