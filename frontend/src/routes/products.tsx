import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useAQI } from "@/hooks/useAQI"
import { useRecommendedProducts, useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/ProductCard"
import { Card } from "@/components/ui/card"
import { Loader2, Package, Filter, Sparkles, ShoppingBag, Brain, ShieldAlert, Zap, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductCategory, RiskLevel } from "@/types/products"

function ProductsPage() {
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>()
    const [showRecommended, setShowRecommended] = useState(true)
    const [page, setPage] = useState(1)
    const limit = 4

    // Get location and AQI for recommendations
    const { coordinates } = useGeolocation()
    const { data: aqiData } = useAQI({
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        enabled: !!coordinates,
    })

    // Determine risk level (simplified)
    const getRisk = (): RiskLevel => {
        if (!aqiData) return "Low"
        if (aqiData.aqi > 200) return "Severe"
        if (aqiData.aqi > 150) return "High"
        if (aqiData.aqi > 100) return "Medium"
        return "Low"
    }

    const risk = getRisk()

    // Get products
    const { data: recommendedData, isLoading: recLoading } = useRecommendedProducts(
        risk,
        aqiData?.iaqi?.pm25?.v,
        false
    )
    const { data: paginatedData, isLoading: allLoading } = useProducts(selectedCategory, page, limit)

    const isLoading = (showRecommended && !selectedCategory) ? recLoading : allLoading

    // Extract products array
    const products = (showRecommended && !selectedCategory)
        ? recommendedData?.products
        : paginatedData?.data

    const totalPages = (showRecommended && !selectedCategory)
        ? 1
        : (paginatedData?.totalPages || 1)

    const categories: Array<{ value: ProductCategory; label: string; icon: string; description: string }> = [
        { value: "mask", label: "Respiratory Shields", icon: "😷", description: "Advanced filtration against airborne particles." },
        { value: "purifier", label: "Atmosphere Purifiers", icon: "💨", description: "HEPA-grade systems for indoor environments." },
        { value: "plant", label: "Organic Bio-Filters", icon: "🌿", description: "NASA-approved natural air purification." },
        { value: "monitor", label: "Intelligence Nodes", icon: "📊", description: "Real-time tracking of local pollutants." },
        { value: "supplement", label: "Biological Fortress", icon: "💊", description: "Immunity and respiratory health support." },
    ]

    return (
        <div className="min-h-screen bg-gray py-8">
            <div className="w-full space-y-10 animate-in fade-in duration-700">
                {/* Dashboard-style Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">Eco Store</h1>
                        </div>
                        <p className="text-xl text-gray-500 font-medium max-w-2xl">
                            Specialized assets to fortify your local ecosystem.
                        </p>
                    </div>
                </header>

                {/* Intelligent Filter Engine */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        {/* Navigation Pills */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-4">Product Categories</h3>
                            <button
                                onClick={() => {
                                    setShowRecommended(true)
                                    setSelectedCategory(undefined)
                                    setPage(1)
                                }}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black",
                                    showRecommended && !selectedCategory
                                        ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200"
                                        : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                                )}
                            >
                                <Sparkles className="w-5 h-5" />
                                Recommendations
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => {
                                        setShowRecommended(false)
                                        setSelectedCategory(cat.value)
                                        setPage(1)
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black",
                                        !showRecommended && selectedCategory === cat.value
                                            ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200"
                                            : "bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 border-2 border-transparent hover:border-emerald-100"
                                    )}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Feed */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Marketplace Feed */}
                        <div className="grid grid-cols-1 gap-6">
                            {isLoading ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <Card key={i} className="p-8 rounded-[2rem] border-2 border-gray-100 animate-pulse">
                                        <div className="flex gap-8">
                                            <div className="w-32 h-32 bg-gray-100 rounded-2xl" />
                                            <div className="flex-1 space-y-4">
                                                <div className="h-6 bg-gray-100 rounded-lg w-1/2" />
                                                <div className="h-10 bg-gray-100 rounded-xl" />
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : products && products.length > 0 ? (
                                <>
                                    {products.map((product: any) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-4 pt-6">
                                            <button
                                                disabled={page === 1}
                                                onClick={() => setPage(p => p - 1)}
                                                className="px-6 py-3 rounded-xl bg-white border-2 border-gray-100 font-black text-gray-600 hover:bg-emerald-50 hover:border-emerald-100 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setPage(i + 1)}
                                                        className={cn(
                                                            "h-10 w-10 rounded-lg font-black transition-all",
                                                            page === i + 1
                                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                                                : "bg-white text-gray-400 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="px-6 py-3 rounded-xl bg-white border-2 border-gray-100 font-black text-gray-600 hover:bg-emerald-50 hover:border-emerald-100 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Card className="p-16 text-center rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-6">
                                    <div className="p-6 bg-gray-50 rounded-full">
                                        <Package className="w-20 h-20 text-gray-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">No Assets Identified</h3>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Route = createFileRoute("/products")({
    component: ProductsPage,
})
