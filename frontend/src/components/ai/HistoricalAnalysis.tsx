import { Card } from "@/components/ui/card"
import { TrendingUp, Calendar } from "lucide-react"

interface HistoricalAnalysisProps {
    similarDays: Array<{
        date: string
        summary: string
        aqi: number
    }>
}

export function HistoricalAnalysis({ similarDays }: HistoricalAnalysisProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Pattern Recognition</h3>
            </div>

            {similarDays?.length ? (
                <div className="space-y-4">
                    {similarDays.map((day, i) => (
                        <Card
                            key={i}
                            className="p-6 bg-white border-2 border-gray-100 rounded-3xl hover:shadow-lg hover:shadow-gray-100 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                        <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-gray-900">
                                            {day.date}
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                            Atmospheric Index: {day.aqi}
                                        </p>
                                    </div>
                                </div>

                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${day.aqi <= 50
                                        ? "bg-emerald-50 text-emerald-700"
                                        : day.aqi <= 100
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-rose-50 text-rose-700"
                                    }`}>
                                    {day.aqi <= 50 ? "Stable" : day.aqi <= 100 ? "Volatile" : "Elevated"}
                                </span>
                            </div>

                            <p className="text-gray-600 font-medium leading-relaxed">
                                {day.summary}
                            </p>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                    <p className="text-gray-500 font-bold italic">
                        Temporal comparison currently establishing baseline...
                    </p>
                </Card>
            )}
        </div>
    )
}
