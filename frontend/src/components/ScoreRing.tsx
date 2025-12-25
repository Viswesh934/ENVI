import { cn } from "@/lib/utils"

export function ScoreRing({ score }: { score: number }) {
  const size = 160
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-600"
    if (s >= 60) return "text-yellow-600"
    if (s >= 40) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-muted"
          stroke="currentColor"
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={cn(
            "transition-all duration-700 ease-out",
            getColor(score)
          )}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={cn(
            "text-5xl font-bold tracking-tight",
            getColor(score)
          )}
        >
          {score}
        </div>
        <div className="mt-1 text-xs font-medium text-muted-foreground">
          ENV SCORE
        </div>
      </div>
    </div>
  )
}

export default ScoreRing
