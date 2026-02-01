import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

import { ActivityCard } from "@/components/ActivityCard"
import { InsightStrip } from "@/components/InsightStrip"
import { SafetyGauge } from "@/components/SafetyGauge"
import { TimeWindowSelector } from "@/components/TimeWindowSelector"
import { EnvironmentalBreakdown } from "@/components/EnvironmentalBreakdown"
import { useActivityRecommendation } from "@/hooks/useActivityRecommendation"
import { useGeolocation } from "@/hooks/useGeolocation"
import { MapPin, AlertTriangle, Activity, Share2, Play, Sparkles } from "lucide-react"

type ActivityType = "walking" | "running" | "cycling" | "kids-play"

const activities: ActivityType[] = ["walking", "running", "cycling", "kids-play"]
const activityLabels: Record<ActivityType, string> = {
  walking: "Walking",
  running: "Running",
  cycling: "Cycling",
  "kids-play": "Kids Play",
}

function ActivityPage() {
  const [selected, setSelected] = useState<ActivityType>("walking")
  const [selectedTime, setSelectedTime] = useState<string>("morning")
  
  // Get user's real location
  const { coordinates, loading: locationLoading, error: locationError } = useGeolocation()

  // Fetch real recommendation data
  const { data, isLoading, error } = useActivityRecommendation(
    {
      activity: selected,
      location: coordinates ? {
        city: "Current Location",
        lat: coordinates.latitude,
        lon: coordinates.longitude,
      } : undefined,
    },
    !!coordinates // Only fetch when we have coordinates
  )

  /* ---------------- Loading ---------------- */
  if (isLoading || locationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-16 w-full max-w-2xl rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    )
  }

  /* ---------------- Error State ---------------- */
  if (error || locationError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 md:px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Guidance</h1>
            <p className="text-lg text-gray-500 font-medium">Plan your outdoor activities with real-time environmental data</p>
          </div>
          <Card className="rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white p-10 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-rose-100 rounded-2xl">
                <AlertTriangle className="h-8 w-8 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-rose-900 mb-2">
                  {locationError ? "Location Access Required" : "Unable to Load Data"}
                </h3>
                <p className="text-base text-rose-800 leading-relaxed">
                  {locationError 
                    ? "Please enable location access to get personalized activity recommendations for your area."
                    : "We couldn't fetch activity recommendations. Please try again later."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) return null

  const aqiStatus = data.advice.level === "avoid" ? "high" : data.advice.level === "caution" ? "moderate" : "good"
  const heatStatus = data.safetyScore > 70 ? "good" : data.safetyScore > 40 ? "moderate" : "high"

  const riskFactors: Array<{ name: string; status: "good" | "moderate" | "high" }> = [
    { name: "AQI", status: aqiStatus },
    { name: "Heat", status: heatStatus },
    { name: "UV", status: "moderate" },
    { name: "Green", status: "good" },
  ]

  /* ---------------- Page ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 md:px-6 py-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/20 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-1000">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Guidance</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <p className="text-lg text-gray-500 font-medium">
                Plan your outdoor activities with real-time environmental data
                {coordinates && (
                  <span className="text-xs ml-2 text-gray-400">
                    ({coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl border-2 border-white p-2 rounded-[2rem] shadow-xl shadow-emerald-100/50">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="pr-4 pl-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Safety Score</p>
              <p className="text-sm font-black text-gray-900">{data?.safetyScore || 0}/100</p>
            </div>
          </div>
        </div>

        {/* Activity Selector */}
        <Card className="rounded-3xl border-2 border-gray-100 bg-white p-8 shadow-xl">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Select Activity</h2>
          <div className="flex flex-wrap gap-3">
            {activities.map((activity) => (
              <Button
                key={activity}
                variant={activity === selected ? "default" : "outline"}
                size="lg"
                onClick={() => setSelected(activity)}
                className={`rounded-2xl px-6 py-6 text-base font-bold transition-all ${
                  activity === selected
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105"
                    : "hover:bg-gray-50 hover:border-emerald-200"
                }`}
              >
                {activityLabels[activity]}
              </Button>
            ))}
          </div>
        </Card>

        {/* Main Activity Analysis Card */}
        <Card className="rounded-3xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 p-10 shadow-xl relative overflow-hidden">
          {/* Decorative background gradient */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none ${
            data.advice.level === "safe" 
              ? "bg-emerald-200/30" 
              : data.advice.level === "caution" 
              ? "bg-amber-200/30" 
              : "bg-rose-200/30"
          }`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
            {/* Left: Safety Gauge */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Safety Analysis</h3>
                <div className="flex items-center justify-center">
                  <SafetyGauge
                    score={data.safetyScore}
                    level={data.advice.level}
                    label={activityLabels[selected]}
                    showFactors={riskFactors}
                    size="lg"
                    animated
                  />
                </div>
              </div>
            </div>

            {/* Right: Advice & Time Windows */}
            <div className="space-y-8">
              {/* Advice Message */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                    data.advice.level === "safe"
                      ? "bg-emerald-100 text-emerald-700"
                      : data.advice.level === "caution"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}>
                    {data.advice.level}
                  </div>
                  <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{data.advice.message}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{data.advice.reasoning}</p>
              </div>

              {/* Time Window Selector */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Best Time Windows</h4>
                <TimeWindowSelector
                  windows={data.timeWindows}
                  selected={selectedTime}
                  onSelect={setSelectedTime}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Environmental Breakdown */}
        {data.environmental && (
          <Card className="rounded-3xl border-2 border-gray-100 bg-white p-10 shadow-xl">
            <EnvironmentalBreakdown
              aqi={data.environmental.aqi}
              temperature={data.environmental.temperature}
              humidity={data.environmental.humidity}
              windSpeed={data.environmental.windSpeed}
              uvIndex={data.environmental.uvIndex}
              pollutants={data.environmental.pollutants}
            />
          </Card>
        )}

        {/* Alternative Activities */}
        {data.alternativeActivities.length > 0 && data.advice.level === "avoid" && (
          <Card className="rounded-3xl border-2 border-gray-100 bg-white p-10 shadow-xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Better Alternatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.alternativeActivities.map((alt, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-8 border-2 border-emerald-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-black text-gray-900">{alt.name}</h3>
                    <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-black">
                      {alt.safetyScore}%
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">{alt.reason}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl font-bold"
                    onClick={() => setSelected(alt.name.toLowerCase().replace(' ', '-') as ActivityType)}
                  >
                    Switch to {alt.name}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Historical Context */}
      <Card className="rounded-3xl border-2 border-gray-100 bg-white p-10 shadow-xl">
        <h2 className="text-2xl font-black text-gray-900 mb-6">This Month's Environmental Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-6 border-2 border-emerald-200">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Best Day</p>
            <p className="text-3xl font-black text-emerald-700">{data.historicalContext.bestDayThisMonth}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-white p-6 border-2 border-rose-200">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 mb-2">Worst Day</p>
            <p className="text-3xl font-black text-rose-700">{data.historicalContext.worstDayThisMonth}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 border-2 border-blue-200">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Average AQI</p>
            <p className="text-3xl font-black text-blue-700">{data.historicalContext.averageAQI}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-white p-6 border-2 border-purple-200">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600 mb-2">Similar Days</p>
            <p className="text-3xl font-black text-purple-700">{data.historicalContext.similarDaysCount} days</p>
          </div>
        </div>
      </Card>

        {/* CTA Buttons */}
        <div className="flex gap-6 flex-wrap justify-center pt-4">
          <Button
            size="lg"
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-6 text-lg shadow-lg shadow-emerald-200 hover:scale-105 transition-all"
            onClick={() => {
              console.log(`Starting ${selected} activity during ${selectedTime}`);
              alert(`Let's go! Starting ${selected.replace("-", " ")} for the ${selectedTime} 🎉`);
            }}
          >
            <Play className="mr-2 h-5 w-5" />
            Start Activity
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl font-black px-8 py-6 text-lg border-2 hover:bg-gray-50 hover:scale-105 transition-all"
            onClick={() => {
              const shareText = `Check out my activity plan for ${selected.replace("-", " ")} during ${selectedTime}! Safety score: ${data?.safetyScore || 0}/100 🌱`;
              if (navigator.share) {
                navigator.share({
                  title: "ENVI Activity Plan",
                  text: shareText,
                }).catch(() => {
                  navigator.clipboard.writeText(shareText);
                  alert("Plan copied to clipboard!");
                });
              } else {
                navigator.clipboard.writeText(shareText);
                alert("Plan copied to clipboard!");
              }
            }}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share Plan
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-400">
            <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
            <span>Guidance powered by real-time air quality, weather & AI predictions</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/activity/")({
  component: ActivityPage,
})
