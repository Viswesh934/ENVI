import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { ScoreRing } from "@/components/ScoreRing"
import { MetricCard } from "@/components/MetricCard"
import { ActivityCard } from "@/components/ActivityCard"
import { InsightStrip } from "@/components/InsightStrip"

type EnvironmentData = {
  aqi: { value: number; status: string }
  treeIndex: { score: number; level: string }
  environmentScore: { score: number; summary: string }
  activity: { level: "safe" | "caution" | "avoid"; message: string }
  insight: string
}

function Home() {
  const [data, setData] = useState<EnvironmentData | null>(null)
  const location = "Hyderabad"

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData({
        aqi: { value: 156, status: "Unhealthy for sensitive groups" },
        treeIndex: { score: 67, level: "Moderate green cover" },
        environmentScore: {
          score: 58,
          summary: "Moderate air quality with decent green cover",
        },
        activity: {
          level: "caution",
          message:
            "Limit prolonged outdoor activity. Prefer shaded routes and avoid peak traffic hours.",
        },
        insight:
          "Tree cover in your area can lower surface temperatures and slightly reduce dust exposure during the day.",
      })
    }, 400)

    return () => clearTimeout(timeout)
  }, [])

  /* -------------------- Loading -------------------- */
  if (!data) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-72 rounded-full mx-auto" />
        <Skeleton className="h-28 rounded-xl" />
      </main>
    )
  }

  /* -------------------- Page -------------------- */
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Today in {location}
        </h1>
        <p className="text-muted-foreground">
          A simple view of your environment right now
        </p>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MetricCard
          icon="🌫️"
          title="Air Quality"
          value={data.aqi.value}
          subtitle={data.aqi.status}
        />
        <MetricCard
          icon="🌳"
          title="Tree Index"
          value={data.treeIndex.score}
          subtitle={data.treeIndex.level}
        />
      </section>

      {/* Environment Score */}
      <section className="flex justify-center">
        <Card className="rounded-3xl p-8 text-center space-y-4">
          <ScoreRing score={data.environmentScore.score} />
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {data.environmentScore.summary}
          </p>
        </Card>
      </section>

      {/* Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Can I go outside?
          </h2>
          <Button variant="outline" size="sm">
            🚶 Walking
          </Button>
        </div>

        <ActivityCard
          level={data.activity.level}
          message={data.activity.message}
        />
      </section>

      {/* Insight */}
      <InsightStrip insight={data.insight} />

      {/* Footer */}
      <footer className="pt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ENVI — Environment, simplified
      </footer>
    </main>
  )
}

export const Route = createFileRoute("/")({
  component: Home,
})
