import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TimeWindowData } from "@/hooks/useActivityRecommendation"
import { Cloud, Sun, Moon, CloudRain } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeWindowSelectorProps {
    windows: TimeWindowData[]
    selected?: string
    onSelect?: (period: string) => void
}

const icons = {
    morning: Sun,
    afternoon: Sun,
    evening: Cloud,
    night: Moon,
}

export function TimeWindowSelector({
    windows,
    selected = "morning",
    onSelect,
}: TimeWindowSelectorProps) {
    const getStatusColor = (score: number) => {
        if (score > 70) return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" }
        if (score > 40) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" }
        return { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600" }
    }

    return (
        <Tabs defaultValue={selected} onValueChange={onSelect} className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent h-auto p-0 mb-6">
                {windows.map((window) => {
                    const Icon = icons[window.period as keyof typeof icons] || Sun
                    const statusColor = getStatusColor(window.safetyScore)
                    const isSelected = window.period === selected

                    return (
                        <TabsTrigger
                            key={window.period}
                            value={window.period}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                                "data-[state=active]:shadow-md",
                                isSelected
                                    ? `${statusColor.bg} border-emerald-500 bg-opacity-100`
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isSelected && statusColor.text)} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                                {window.label.split(" ")[1]}
                            </span>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-black text-gray-800">{window.aqi}</span>
                                <span className="text-[8px] font-bold text-gray-500">AQI</span>
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-black",
                                    window.safetyScore > 70
                                        ? "text-emerald-600"
                                        : window.safetyScore > 40
                                          ? "text-amber-600"
                                          : "text-rose-600"
                                )}
                            >
                                {window.safetyScore}%
                            </span>
                            {window.isBestTime && (
                                <span className="text-[9px] font-black text-emerald-600 uppercase">
                                    ⭐ Best
                                </span>
                            )}
                        </TabsTrigger>
                    )
                })}
            </TabsList>

            {windows.map((window) => (
                <TabsContent key={window.period} value={window.period} className="space-y-4 animate-in fade-in-50 duration-200">
                    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 border-2 border-gray-200">
                        {/* Main Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Temperature */}
                            <div className="rounded-xl bg-white p-4 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Temperature</p>
                                <p className="text-3xl font-black text-gray-900">{window.temperature}°</p>
                                <p className="text-xs text-gray-500 mt-1">Feels like {Math.round(window.temperature + 2)}°</p>
                            </div>

                            {/* UV Index */}
                            <div className="rounded-xl bg-white p-4 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">UV Index</p>
                                <p className="text-3xl font-black text-gray-900">{window.uvIndex}/11</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {window.uvIndex > 7 ? "High" : window.uvIndex > 5 ? "Moderate" : "Low"}
                                </p>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase">Why this time?</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                    <span>
                                        Air quality is{" "}
                                        <span className="font-semibold">
                                            {window.aqi < 50 ? "excellent" : window.aqi < 100 ? "acceptable" : "challenging"}
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                    <span>
                                        Temperature is{" "}
                                        <span className="font-semibold">
                                            {window.temperature < 25 ? "cool" : window.temperature < 35 ? "warm" : "hot"}
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                    <span>
                                        Overall safety score:{" "}
                                        <span className="font-black">{window.safetyScore}%</span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    )
}
