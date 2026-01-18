import { createFileRoute } from "@tanstack/react-router"
import { MapPin, RefreshCw, AlertCircle } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricCard } from "@/components/MetricCard"
import { ActivityCard } from "@/components/ActivityCard"
import { InsightStrip } from "@/components/InsightStrip"

import { useGeolocation } from "@/hooks/useGeolocation"
import { useAQI, getAQIStatus } from "@/hooks/useAQI"

function CityAQI() {
  const { city } = Route.useParams()

  // Use geolocation when city is "current" or "me"
  const useCurrentLocation = city === "current" || city === "me"

  const { coordinates, error: locationError, loading: locationLoading } = useGeolocation()

  const {
    data: aqiData,
    isLoading: aqiLoading,
    error: aqiError,
    refetch,
  } = useAQI({
    latitude: coordinates?.latitude ?? 0,
    longitude: coordinates?.longitude ?? 0,
    enabled: useCurrentLocation && !!coordinates,
  })

  /* ---------------- Loading State ---------------- */
  if ((useCurrentLocation && locationLoading) || (aqiLoading && coordinates)) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </main>
    )
  }

  /* ---------------- Error States ---------------- */
  if (useCurrentLocation && locationError) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Card className="p-8 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Location Access Required</h2>
          </div>
          <p className="text-muted-foreground">{locationError}</p>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              To view air quality data for your current location, please enable location
              access in your browser settings and refresh the page.
            </p>
          </div>
        </Card>
      </main>
    )
  }

  if (useCurrentLocation && aqiError) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Card className="p-8 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Failed to Load AQI Data</h2>
          </div>
          <p className="text-muted-foreground">
            {aqiError instanceof Error ? aqiError.message : "An unknown error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </Card>
      </main>
    )
  }

  // If not using current location, show placeholder for city-based lookup
  if (!useCurrentLocation) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Card className="p-8 space-y-4">
          <h2 className="text-2xl font-semibold">AQI for {city}</h2>
          <p className="text-muted-foreground">
            City-based AQI lookup coming soon. For now, use <a href="/aqi/current" className="text-primary underline">current location</a>.
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
  const { status, color, advice, level } = getAQIStatus(aqiValue)
  const dominantPollutant = aqiData.dominentpol?.toUpperCase() || "N/A"
  const cityName = aqiData.city?.name || "Your Location"

  // Map AQI level to activity advice level
  const activityLevel: "safe" | "caution" | "avoid" =
    level === "good" ? "safe" :
      level === "moderate" || level === "unhealthy-sensitive" ? "caution" :
        "avoid"

  // Get pollutant insights
  const getPollutantInsight = (pollutant: string) => {
    const insights: Record<string, string> = {
      "PM2.5": "PM2.5 particles are fine particles less than 2.5 micrometers in diameter. They can penetrate deep into the lungs and even enter the bloodstream, posing serious health risks.",
      "PM10": "PM10 particles are inhalable particles with diameters of 10 micrometers or less. They can cause respiratory issues and aggravate existing heart and lung conditions.",
      "O3": "Ozone (O3) at ground level is a harmful air pollutant. It can trigger asthma attacks and cause breathing difficulties, especially during hot weather.",
      "NO2": "Nitrogen Dioxide (NO2) primarily comes from vehicle emissions. It can irritate airways and worsen respiratory diseases like asthma.",
      "SO2": "Sulfur Dioxide (SO2) can affect the respiratory system and make breathing difficult. It's mainly produced by burning fossil fuels.",
      "CO": "Carbon Monoxide (CO) reduces oxygen delivery to the body's organs and tissues. High levels can be particularly dangerous for people with heart disease.",
    }
    return insights[pollutant] || `${pollutant} is currently the dominant pollutant affecting air quality in your area.`
  }

  /* ---------------- Page Render ---------------- */
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Air Quality Near You
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <p>Current air conditions in {cityName}</p>
        </div>
        {coordinates && (
          <p className="text-xs text-muted-foreground">
            Lat: {coordinates.latitude.toFixed(4)}, Lon: {coordinates.longitude.toFixed(4)}
          </p>
        )}
      </header>

      {/* AQI Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MetricCard
          icon="🌫️"
          title="AQI"
          value={aqiValue}
          subtitle={status}
        />
        <MetricCard
          icon="🧪"
          title="Dominant Pollutant"
          value={0}
          subtitle={dominantPollutant}
        />
      </section>

      {/* What this means */}
      <section>
        <Card className="p-6 space-y-2">
          <p className="text-sm font-semibold">What this means</p>
          <p className={`text-sm ${color}`}>{advice}</p>
        </Card>
      </section>

      {/* Action */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Should I go outside?</h2>
        <ActivityCard
          level={activityLevel}
          message={advice}
        />
      </section>

      {/* Insight */}
      <InsightStrip insight={getPollutantInsight(dominantPollutant)} />

      {/* Additional Data */}
      {aqiData.iaqi && Object.keys(aqiData.iaqi).length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pollutant Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(aqiData.iaqi).map(([pollutant, data]) => (
              <Card key={pollutant} className="p-4">
                <p className="text-xs text-muted-foreground uppercase">
                  {pollutant}
                </p>
                <p className="text-2xl font-bold">{data.v}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Footer */}
      <footer className="pt-8 text-center text-xs text-muted-foreground">
        AQI data updates periodically • ENVI • Powered by WAQI
      </footer>
    </main>
  )
}

export const Route = createFileRoute("/aqi/$city")({
  component: CityAQI,
})
