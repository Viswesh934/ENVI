import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { ActivityCard } from "@/components/ActivityCard"
import { InsightStrip } from "@/components/InsightStrip"

type ActivityType = "Walking" | "Running" | "Cycling" | "Kids play"

type ActivityData = {
  activity: ActivityType
  advice: {
    level: "safe" | "caution" | "avoid"
    message: string
  }
  insight: string
}

const activities: ActivityType[] = [
  "Walking",
  "Running",
  "Cycling",
  "Kids play",
]

function ActivityPage() {
  const [selected, setSelected] = useState<ActivityType>("Walking")
  const [data, setData] = useState<ActivityData | null>(null)
  const location = "Hyderabad"

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData(null)
      setTimeout(() => {
        setData({
          activity: selected,
          advice: {
            level:
              selected === "Running"
                ? "avoid"
                : selected === "Cycling"
                ? "caution"
                : "safe",
            message:
              selected === "Running"
                ? "High pollution and heat make running uncomfortable. Consider indoor exercise."
                : selected === "Cycling"
                ? "Cycling is possible for short durations. Prefer less busy roads and shaded areas."
                : "Short outdoor activity is generally comfortable today, especially during mornings.",
          },
          insight:
            "Air quality and heat affect high-exertion activities more than casual movement.",
        })
      }, 0)
    }, 0)

    return () => clearTimeout(timeout)
  }, [selected])

  /* ---------------- Loading ---------------- */
  if (!data) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full max-w-sm" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </main>
    )
  }

  /* ---------------- Page ---------------- */
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Activity Guidance
        </h1>
        <p className="text-muted-foreground">
          Environmental suitability for activities in {location}
        </p>
      </header>

      {/* Activity selector */}
      <section className="flex flex-wrap gap-2">
        {activities.map(activity => (
          <Button
            key={activity}
            variant={activity === selected ? "default" : "outline"}
            size="sm"
            onClick={() => setSelected(activity)}
          >
            {activity}
          </Button>
        ))}
      </section>

      {/* Advice */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {selected} — is it a good idea?
        </h2>

        <ActivityCard
          level={data.advice.level}
          message={data.advice.message}
        />
      </section>

      {/* Insight */}
      <InsightStrip insight={data.insight} />

      {/* Footer */}
      <footer className="pt-8 text-center text-xs text-muted-foreground">
        Guidance adapts based on current air quality, heat, and green cover • ENVI
      </footer>
    </main>
  )
}

export const Route = createFileRoute("/activity/")({
  component: ActivityPage,
})
