import { AlertCircle, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { formatInsight } from "../../lib/markdownUtils"
import type { RiskLevel } from "@/types/products"

interface HealthInsightsProps {
    advice: string
    risk: RiskLevel
    healthImpacts: string[]
}

export function HealthInsights({ advice, risk, healthImpacts }: HealthInsightsProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-xl">
                        <Heart className="h-5 w-5 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">Health Advisory</h3>
                </div>
                <Card className="p-8 bg-white border-2 border-gray-100 rounded-[2rem] shadow-sm">
                    <div className="prose prose-emerald prose-lg max-w-none 
                        prose-headings:text-gray-900 prose-headings:font-black 
                        prose-p:text-gray-600 prose-p:font-medium prose-p:leading-relaxed">
                        {formatInsight(advice)}
                    </div>
                </Card>
            </div>

            {healthImpacts?.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-gray-900">Manifest Observations</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {healthImpacts.map((impact, i) => (
                            <Card
                                key={i}
                                className="p-5 bg-gray-50/50 border-2 border-gray-100 rounded-2xl hover:border-emerald-200 transition-colors group"
                            >
                                <div className="flex gap-4">
                                    <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                                        <AlertCircle className="text-emerald-600 h-5 w-5" />
                                    </div>
                                    <p className="text-gray-700 font-medium leading-tight">
                                        {impact}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Risk Assessment</p>
                        <p className="text-2xl font-black text-gray-900">{risk}</p>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`w-3 h-8 rounded-full ${(risk === 'Low' && level === 1) || (risk === 'Medium' && level <= 3) || (risk === 'High' && level <= 5)
                                    ? 'bg-emerald-500' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
