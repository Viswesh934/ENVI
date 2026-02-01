import { Wind, Droplets, Eye, Cloud, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnvironmentalBreakdownProps {
    aqi: number
    temperature: number
    humidity: number
    windSpeed: number
    uvIndex: number
    pollutants?: Record<string, number>
}

export function EnvironmentalBreakdown({
    aqi,
    temperature,
    humidity,
    windSpeed,
    uvIndex,
    pollutants = {},
}: EnvironmentalBreakdownProps) {
    const getAqiStatus = (value: number) => {
        if (value <= 50) return { label: "Good", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
        if (value <= 100) return { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
        if (value <= 150) return { label: "Unhealthy for Sensitive Groups", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" }
        if (value <= 200) return { label: "Unhealthy", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
        return { label: "Hazardous", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" }
    }

    const aqiStatus = getAqiStatus(aqi)

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Environmental Conditions</h3>

            {/* AQI Hero */}
            <div className={cn("rounded-2xl p-8 border-2", aqiStatus.bg, aqiStatus.border)}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className={cn("text-sm font-semibold uppercase mb-2", aqiStatus.color)}>Air Quality Index</p>
                        <p className={cn("text-5xl font-black", aqiStatus.color)}>{aqi}</p>
                    </div>
                    <div className={cn("px-4 py-2 rounded-full text-sm font-bold", aqiStatus.bg, aqiStatus.color)}>
                        {aqiStatus.label}
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    {aqi <= 50
                        ? "Air quality is excellent. Perfect for outdoor activities."
                        : aqi <= 100
                          ? "Acceptable air quality. Outdoor activities are possible."
                          : "Unhealthy air quality. Limit outdoor activities and use protection."}
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Temperature */}
                <div className="rounded-xl bg-white p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Temperature</p>
                        <span className="text-xl">🌡️</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{Math.round(temperature)}°C</p>
                    <p className="text-xs text-gray-600">
                        {temperature < 15 ? "Cold" : temperature < 25 ? "Comfortable" : temperature < 35 ? "Warm" : "Hot"}
                    </p>
                </div>

                {/* Humidity */}
                <div className="rounded-xl bg-white p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Humidity</p>
                        <Droplets className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{Math.round(humidity)}%</p>
                    <p className="text-xs text-gray-600">
                        {humidity < 30 ? "Dry" : humidity < 60 ? "Moderate" : "Humid"}
                    </p>
                </div>

                {/* Wind Speed */}
                <div className="rounded-xl bg-white p-4 border-2 border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Wind Speed</p>
                        <Wind className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{Math.round(windSpeed)}</p>
                    <p className="text-xs text-gray-600">km/h</p>
                </div>

                {/* UV Index */}
                <div className="rounded-xl bg-white p-4 border-2 border-gray-200 hover:border-yellow-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">UV Index</p>
                        <span className="text-xl">☀️</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{uvIndex}/11</p>
                    <p className="text-xs text-gray-600">
                        {uvIndex <= 2 ? "Low" : uvIndex <= 5 ? "Moderate" : uvIndex <= 7 ? "High" : "Very High"}
                    </p>
                </div>

                {/* Visibility */}
                <div className="rounded-xl bg-white p-4 border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Visibility</p>
                        <Eye className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">Good</p>
                    <p className="text-xs text-gray-600">Clear view</p>
                </div>

                {/* Air Movement */}
                <div className="rounded-xl bg-white p-4 border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Air Flow</p>
                        <Cloud className="h-5 w-5 text-gray-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">
                        {windSpeed > 15 ? "Good" : windSpeed > 5 ? "Moderate" : "Poor"}
                    </p>
                    <p className="text-xs text-gray-600">Wind circulation</p>
                </div>
            </div>

            {/* Pollutant Details */}
            {Object.keys(pollutants).length > 0 && (
                <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-900">Pollutant Breakdown</h4>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(pollutants).map(([name, value]) => (
                            <div key={name} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-amber-900">{name.toUpperCase()}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 bg-white rounded-full h-2 border border-amber-300 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all",
                                                (value as number) > 100 ? "bg-red-500" : (value as number) > 50 ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min(100, ((value as number) / 150) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 w-16 text-right">{value} µg/m³</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Health Impact Notice */}
            <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-4">
                <p className="text-sm text-blue-900">
                    <span className="font-semibold">💡 Tip:</span> Sensitive groups (children, elderly, those with respiratory conditions) should take extra precautions when
                    air quality is moderate or worse.
                </p>
            </div>
        </div>
    )
}
