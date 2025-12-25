import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { MetricCard } from "@/components/MetricCard"
import { InsightStrip } from "@/components/InsightStrip"
import { ActivityCard } from "@/components/ActivityCard"

type TreeData = {
  treeIndex: {
    score: number
    level: string
  }
  benefits: string
  advice: {
    level: "safe" | "caution" | "avoid"
    message: string
  }
  insight: string
}

function TreeIndexPage() {
  const [data, setData] = useState<TreeData | null>(null)
  const location = "Hyderabad"

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData({
        treeIndex: {
          score: 67,
          level: "Moderate green cover",
        },
        benefits:
          "Tree cover helps reduce surface temperatures, improves walkability, and slightly buffers air pollution.",
        advice: {
          level: "safe",
          message:
            "Short walks in shaded streets or parks are comfortable today, especially during mornings and evenings.",
        },
        insight:
          "Areas with higher tree density can feel 3–5°C cooler during the day compared to exposed roads.",
      })
    }, 400)

    return () => clearTimeout(timeout)
  }, [])

  /* ---------------- Loading ---------------- */
  if (!data) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </main>
    )
  }

  /* ---------------- Page ---------------- */
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Green Cover
        </h1>
        <p className="text-muted-foreground">
          Tree density and shade around {location}
        </p>
      </header>

      {/* Tree Index Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MetricCard
          icon="🌳"
          title="Tree Index"
          value={data.treeIndex.score}
          subtitle={data.treeIndex.level}
        />
        <MetricCard
          icon="☀️"
          title="Heat Buffer"
          value={50}
          subtitle="Based on local tree cover"
        />
      </section>

      {/* What this means */}
      <section>
        <Card className="p-6 space-y-2">
          <p className="text-sm font-semibold">
            Why green cover matters
          </p>
          <p className="text-sm text-muted-foreground">
            {data.benefits}
          </p>
        </Card>
      </section>

      {/* Activity guidance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Outdoor comfort today
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
        Tree data derived from local green cover estimates • ENVI
      </footer>
    </main>
  )
}

export const Route = createFileRoute("/tree/")({
  component: TreeIndexPage,
})
