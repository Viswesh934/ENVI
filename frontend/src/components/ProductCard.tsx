import { ExternalLink, Star, ShoppingCart, Leaf, ShieldCheck, Trophy, BadgeCheck, Zap } from "lucide-react"
import { Card } from "./ui/card"
import { cn } from "@/lib/utils"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useAQI } from "@/hooks/useAQI"
import type { EcoProduct } from "@/types/products"

interface ProductCardProps {
    product: EcoProduct
}

export function ProductCard({ product }: ProductCardProps) {
    const { coordinates } = useGeolocation()
    const { data: aqiData } = useAQI({
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        enabled: !!coordinates,
    })

    const categoryIcons: Record<string, string> = {
        mask: "😷",
        purifier: "💨",
        plant: "🌿",
        monitor: "📊",
        supplement: "💊",
    }

    const calculateMatch = () => {
        if (!aqiData) return 85
        let score = 80
        const pm25 = aqiData.iaqi?.pm25?.v || aqiData.aqi
        if (product.helpsWith.includes("pm25") && pm25 > 100) score += 15
        if (product.category === "plant" && pm25 < 50) score += 10
        if (product.category === "purifier" && pm25 > 150) score += 18
        return Math.min(score, 99)
    }

    const matchScore = calculateMatch()
    const ecoScore = product.ecoScore || 82

    return (
        <Card className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 transition-all hover:shadow-xl hover:border-emerald-100">
            <div className="flex gap-6">
                {/* Visual Area - Compact */}
                <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform border border-transparent group-hover:border-emerald-100">
                        {categoryIcons[product.category] || "📦"}
                    </div>
                </div>

                {/* Content Area - Streamlined */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-xl font-black text-gray-900 truncate">
                                {product.name}
                            </h3>
                            <div className="text-xl font-black text-emerald-600 shrink-0">
                                ₹{product.price.toLocaleString()}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.brand || "Authentic"}</span>
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-black text-gray-600">{product.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Zap className="h-2 w-2 fill-current" />
                                <span className="text-[9px] font-black">{matchScore}% Match</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-3">
                        <div className="flex flex-wrap gap-1.5">
                            {product.sustainabilityTags?.slice(0, 1).map((tag) => (
                                <span key={tag} className="text-[9px] font-bold bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">
                                    {tag}
                                </span>
                            ))}
                            {product.helpsWith.slice(0, 2).map((help) => (
                                <span key={help} className="text-[9px] font-bold text-emerald-600">
                                    • {help}
                                </span>
                            ))}
                        </div>

                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 px-6 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-95"
                        >
                            Acquire
                            <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                    </div>
                </div>
            </div>
        </Card>
    )
}
