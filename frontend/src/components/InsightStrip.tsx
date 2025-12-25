import { Card } from "@/components/ui/card"

export function InsightStrip({ insight }: { insight: string }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border bg-muted/40">
      {/* Accent */}
      <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />

      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div className="mt-0.5 text-2xl">💡</div>

        {/* Content */}
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Today’s Insight
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {insight}
          </p>
        </div>
      </div>
    </Card>
  )
}
