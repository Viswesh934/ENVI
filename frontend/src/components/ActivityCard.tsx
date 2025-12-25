import { cn } from "@/lib/utils"

type Level = "safe" | "caution" | "avoid"

export function ActivityCard({
  level,
  message,
}: {
  level: Level
  message: string
}) {
  const config: Record<
    Level,
    {
      container: string
      badge: string
      icon: string
      label: string
    }
  > = {
    safe: {
      container:
        "border-emerald-200 bg-emerald-50/70 text-emerald-800",
      badge:
        "bg-emerald-100 text-emerald-700",
      icon: "✓",
      label: "Safe to go outside",
    },
    caution: {
      container:
        "border-amber-200 bg-amber-50/70 text-amber-800",
      badge:
        "bg-amber-100 text-amber-700",
      icon: "⚠",
      label: "Use caution",
    },
    avoid: {
      container:
        "border-red-200 bg-red-50/70 text-red-800",
      badge:
        "bg-red-100 text-red-700",
      icon: "✕",
      label: "Avoid outdoors",
    },
  }

  const cfg = config[level]

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 transition-all",
        "hover:shadow-sm",
        cfg.container
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none">{cfg.icon}</span>
          <p className="text-base font-semibold text-foreground">
            {cfg.label}
          </p>
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            cfg.badge
          )}
        >
          {level.toUpperCase()}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  )
}
