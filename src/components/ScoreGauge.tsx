"use client";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreGauge({
  score,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let colorClass = "stroke-rose-500";
  let textClass = "text-rose-400";
  let label = "Critical";

  if (clampedScore >= 85) {
    colorClass = "stroke-emerald-500";
    textClass = "text-emerald-400";
    label = "Excellent";
  } else if (clampedScore >= 70) {
    colorClass = "stroke-blue-500";
    textClass = "text-blue-400";
    label = "Good";
  } else if (clampedScore >= 45) {
    colorClass = "stroke-amber-500";
    textClass = "text-amber-400";
    label = "Needs Attention";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-zinc-800/80"
          />
          {/* Active progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-white">{clampedScore}</span>
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <div className={`mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/60 ${textClass}`}>
          {label}
        </div>
      )}
    </div>
  );
}
