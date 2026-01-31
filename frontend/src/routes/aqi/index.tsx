import { createFileRoute } from "@tanstack/react-router"
import { MapPin, Wind, AlertCircle, Eye, Sparkles } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PollutantInsightModal } from "@/components/PollutantInsightModal"
import { RiskBadge } from "@/components/RiskBadge"
import { AIInsightsPanel } from "@/components/AIInsightsPanel"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useAQI, getAQIStatus } from "@/hooks/useAQI"
import { usePollutantInsight, type PollutantInsightRequest } from "@/hooks/usePollutantInsight"
import { useAIAdvisor } from "@/hooks/useAIAdvisor"

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

  // Get AI health advice
  const { data: aiAdvice, isLoading: adviceLoading } = useAIAdvisor({
    aqi: aqiData?.aqi || 0,
    pm25: aqiData?.iaqi?.pm25?.v,
    pm10: aqiData?.iaqi?.pm10?.v,
    no2: aqiData?.iaqi?.no2?.v,
    location: aqiData?.city
      ? {
        city: aqiData.city.name,
        lat: aqiData.city.geo[0],
        lon: aqiData.city.geo[1],
      }
      : undefined,
  })

  // State for pollutant insight modal
  type SelectedPollutantState = {
    pollutant: string
    value: number
    cityName: string
    aqi: number
    allPollutants: { [key: string]: number }
  } | null

  const [selectedPollutant, setSelectedPollutant] = useState<SelectedPollutantState>(null)

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- Error States ---------------- */
  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Access Required</h1>
          <p className="text-gray-600 mb-6">{locationError}</p>
          <p className="text-sm text-gray-500">
            Enable location access in your browser to view air quality data for your area.
          </p>
        </Card>
      </div>
    )
  }

  if (aqiError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Air Quality Data</h1>
          <p className="text-gray-600">
            {aqiError instanceof Error ? aqiError.message : "An error occurred while fetching data"}
          </p>
        </Card>
      </div>
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
    if (aqiValue <= 50)
      return {
        bg: "from-green-500 to-emerald-600",
        text: "text-green-700",
        border: "border-green-200",
        cardBg: "bg-green-50/50",
        glow: "shadow-green-500/20",
      }
    if (aqiValue <= 100)
      return {
        bg: "from-yellow-500 to-amber-600",
        text: "text-yellow-700",
        border: "border-yellow-200",
        cardBg: "bg-yellow-50/50",
        glow: "shadow-yellow-500/20",
      }
    if (aqiValue <= 150)
      return {
        bg: "from-orange-500 to-orange-600",
        text: "text-orange-700",
        border: "border-orange-200",
        cardBg: "bg-orange-50/50",
        glow: "shadow-orange-500/20",
      }
    if (aqiValue <= 200)
      return {
        bg: "from-red-500 to-red-600",
        text: "text-red-700",
        border: "border-red-200",
        cardBg: "bg-red-50/50",
        glow: "shadow-red-500/20",
      }
    if (aqiValue <= 300)
      return {
        bg: "from-purple-500 to-purple-600",
        text: "text-purple-700",
        border: "border-purple-200",
        cardBg: "bg-purple-50/50",
        glow: "shadow-purple-500/20",
      }
    return {
      bg: "from-red-700 to-red-900",
      text: "text-red-900",
      border: "border-red-300",
      cardBg: "bg-red-100/50",
      glow: "shadow-red-700/20",
    }
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
    <div className="min-h-screen bg-gradient-to-b p-4 md:p-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Air Quality</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{cityName}</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AQI Hero Card */}
          <div className="lg:col-span-2">
            <Card
              className={`p-6`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wind className="h-6 w-6" />
                    <h2 className="text-xl font-semibold">Air Quality Index</h2>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="text-7xl font-bold">{aqiValue}</div>
                    {aiAdvice?.risk && (
                      <div className="mb-2">
                        <RiskBadge risk={aiAdvice.risk} size="md" />
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-medium mt-4 opacity-90">{status}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl mb-2">{getActivityIcon()}</div>
                  <p className="text-sm opacity-80">{advice}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Dominant Pollutant Card */}
          <div>
            <Card className="p-6 h-full border-2 border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-6 w-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Dominant Pollutant</h2>
              </div>
              <div className="text-center mt-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">{dominantPollutant}</div>
                <p className="text-gray-600">
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
        </div>

        {/* Pollutant Breakdown - Clickable Cards */}
        {aqiData.iaqi && Object.keys(aqiData.iaqi).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Detailed Breakdown</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="h-4 w-4" />
                <span>Click for AI insights</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(aqiData.iaqi).map(([pollutant, data]) => (
                <Card
                  key={pollutant}
                  className={`p-4 cursor-pointer border-2 hover:border-blue-300 hover:shadow-lg transition-all duration-200 ${colors.cardBg}`}
                  onClick={() => handlePollutantClick(pollutant, data.v)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-500">{pollutant}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {typeof data.v === "number" ? data.v.toFixed(2) : data.v}
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">Click for insights</div>
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* AI Insights Panel Component */}
        <AIInsightsPanel aiAdvice={aiAdvice} isLoading={adviceLoading} />


        {/* Coordinates Footer */}
        {coordinates && (
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>
                {coordinates.latitude.toFixed(4)}°N, {coordinates.longitude.toFixed(4)}°E
              </span>
            </div>
          </div>
        )}
      </div>

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
    </div>
  )
}

export const Route = createFileRoute("/aqi/")({
  component: AirQualityPage,
})