import { createFileRoute } from "@tanstack/react-router"
import { MapPin, Wind, AlertCircle, Droplets, Eye, Sparkles } from "lucide-react"
import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PollutantInsightModal } from "@/components/PollutantInsightModal"

import { useGeolocation } from "@/hooks/useGeolocation"
import { useAQI, getAQIStatus } from "@/hooks/useAQI"
import { usePollutantInsight, type PollutantInsightRequest } from "@/hooks/usePollutantInsight"

function AirQualityPage() {
  const { coordinates, error: locationError, loading: locationLoading } = useGeolocation()

  const {
    data: aqiData,
    isLoading: aqiLoading,
    error: aqiError,
  } = useAQI({
    latitude: coordinates?.latitude ?? 0,
    longitude: coordinates?.longitude ?? 0,
    enabled: !!coordinates,
  })

  // State for pollutant insight modal
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantInsightRequest | null>(null)

  // Fetch insight for selected pollutant
  const {
    data: insightData,
    isLoading: insightLoading,
    error: insightError,
  } = usePollutantInsight(selectedPollutant, !!selectedPollutant)

  // Handle pollutant card click
  const handlePollutantClick = (pollutant: string, value: number) => {
    if (!aqiData) return

    const allPollutants: { [key: string]: number } = {}
    if (aqiData.iaqi) {
      Object.entries(aqiData.iaqi).forEach(([key, data]) => {
        allPollutants[key] = data.v
      })
    }

    setSelectedPollutant({
      pollutant,
      value,
      cityName: aqiData.city?.name || "Your Location",
      aqi: aqiData.aqi,
      allPollutants,
    })
  }

  /* ---------------- Loading State ---------------- */
  if (locationLoading || (aqiLoading && coordinates)) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </main>
    )
  }

  /* ---------------- Error States ---------------- */
  if (locationError) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Card className="p-8 space-y-4 border-red-200 bg-red-50/50">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Location Access Required</h2>
          </div>
          <p className="text-red-600/80">{locationError}</p>
          <p className="text-sm text-red-600/60">
            Enable location access in your browser to view air quality data for your area.
          </p>
        </Card>
      </main>
    )
  }

  if (aqiError) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Card className="p-8 space-y-4 border-red-200 bg-red-50/50">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Unable to Load Air Quality Data</h2>
          </div>
          <p className="text-red-600/80">
            {aqiError instanceof Error ? aqiError.message : "An error occurred while fetching data"}
          </p>
        </Card>
      </main>
    )
  }

  if (!aqiData) {
    return null
  }

  /* ---------------- Data Processing ---------------- */
  const aqiValue = aqiData.aqi
  const { status, advice, level } = getAQIStatus(aqiValue)
  const dominantPollutant = aqiData.dominentpol?.toUpperCase() || "N/A"
  const cityName = aqiData.city?.name || "Your Location"

  // Get AQI color and gradient based on level
  const getAQIColor = () => {
    if (aqiValue <= 50) return { bg: "from-green-500 to-emerald-600", text: "text-green-700", border: "border-green-200", cardBg: "bg-green-50/50" }
    if (aqiValue <= 100) return { bg: "from-yellow-500 to-amber-600", text: "text-yellow-700", border: "border-yellow-200", cardBg: "bg-yellow-50/50" }
    if (aqiValue <= 150) return { bg: "from-orange-500 to-orange-600", text: "text-orange-700", border: "border-orange-200", cardBg: "bg-orange-50/50" }
    if (aqiValue <= 200) return { bg: "from-red-500 to-red-600", text: "text-red-700", border: "border-red-200", cardBg: "bg-red-50/50" }
    if (aqiValue <= 300) return { bg: "from-purple-500 to-purple-600", text: "text-purple-700", border: "border-purple-200", cardBg: "bg-purple-50/50" }
    return { bg: "from-red-700 to-red-900", text: "text-red-900", border: "border-red-300", cardBg: "bg-red-100/50" }
  }

  const colors = getAQIColor()

  // Get activity recommendation
  const getActivityIcon = () => {
    if (level === "good") return "✅"
    if (level === "moderate" || level === "unhealthy-sensitive") return "⚠️"
    return "🚫"
  }

  /* ---------------- Page Render ---------------- */
  return (
    <>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Air Quality</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{cityName}</span>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AQI Hero Card */}
          <Card className={`lg:col-span-2 p-8 ${colors.border} ${colors.cardBg} border-2`}>
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Air Quality Index</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className={`text-7xl font-bold ${colors.text}`}>{aqiValue}</h2>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.bg} text-white text-sm font-semibold`}>
                      {status}
                    </div>
                  </div>
                </div>
                <div className="text-4xl">{getActivityIcon()}</div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm leading-relaxed text-muted-foreground">{advice}</p>
              </div>
            </div>
          </Card>

          {/* Dominant Pollutant Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wind className="w-5 h-5" />
              <p className="text-sm font-medium">Dominant Pollutant</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{dominantPollutant}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {dominantPollutant === "PM2.5" && "Fine particulate matter"}
                {dominantPollutant === "PM10" && "Coarse particulate matter"}
                {dominantPollutant === "O3" && "Ground-level ozone"}
                {dominantPollutant === "NO2" && "Nitrogen dioxide"}
                {dominantPollutant === "SO2" && "Sulfur dioxide"}
                {dominantPollutant === "CO" && "Carbon monoxide"}
                {!["PM2.5", "PM10", "O3", "NO2", "SO2", "CO"].includes(dominantPollutant) && "Primary air pollutant"}
              </p>
            </div>
          </Card>
        </div>

        {/* Pollutant Breakdown - Clickable Cards */}
        {aqiData.iaqi && Object.keys(aqiData.iaqi).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Detailed Breakdown
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Click for AI insights
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(aqiData.iaqi).map(([pollutant, data]) => (
                <Card
                  key={pollutant}
                  className="p-4 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
                  onClick={() => handlePollutantClick(pollutant, data.v)}
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide group-hover:text-primary transition-colors">
                    {pollutant}
                  </p>
                  <p className="text-3xl font-bold mt-2">
                    {typeof data.v === 'number' ? data.v.toFixed(2) : data.v}
                  </p>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <Card className="p-6 bg-muted/30">
          <div className="flex items-start gap-3">
            <Droplets className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">About Air Quality</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Air Quality Index (AQI) is calculated based on pollutant concentrations.
                Data updates automatically and is cached for optimal performance.
                Click any pollutant card above for AI-powered insights.
              </p>
            </div>
          </div>
        </Card>

        {/* Coordinates Footer */}
        {coordinates && (
          <p className="text-xs text-center text-muted-foreground">
            {coordinates.latitude.toFixed(4)}°N, {coordinates.longitude.toFixed(4)}°E
          </p>
        )}
      </main>

      {/* Pollutant Insight Modal */}
      <PollutantInsightModal
        isOpen={!!selectedPollutant}
        onClose={() => setSelectedPollutant(null)}
        pollutant={selectedPollutant?.pollutant || ""}
        value={selectedPollutant?.value || 0}
        insight={insightData?.insight || null}
        isLoading={insightLoading}
        error={insightError}
      />
    </>
  )
}

export const Route = createFileRoute("/aqi/")({
  component: AirQualityPage,
})
