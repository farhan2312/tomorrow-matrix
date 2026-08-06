import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  size?: number;
  label?: string;
  className?: string;
}

export function HealthGauge({ value, size = 180, label = "Terra Health", className }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    value >= 70 ? "var(--terra)" : value >= 50 ? "var(--ind-economy)" : value >= 35 ? "var(--warmth)" : "var(--destructive)";
  const status = value >= 70 ? "Healthy" : value >= 50 ? "Recovering" : value >= 35 ? "At Risk" : "Critical";

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--color-border)" strokeWidth={10} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={10} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-4xl font-semibold text-foreground">{value}<span className="text-base text-muted-foreground">%</span></div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-xs font-medium" style={{ color }}>{status}</div>
      </div>
    </div>
  );
}
