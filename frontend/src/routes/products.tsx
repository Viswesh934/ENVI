import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useAQI } from "@/hooks/useAQI"
import { useRecommendedProducts, useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/ProductCard"
import { Card } from "@/components/ui/card"
import { Loader2, Package, Filter, Sparkles, ShoppingBag } from "lucide-react"
import type { ProductCategory, RiskLevel } from "@/types/products"

function ProductsPage() {
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>()
    const [showRecommended, setShowRecommended] = useState(true)

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
    const { data: allProducts, isLoading: allLoading } = useProducts(selectedCategory)

    const isLoading = showRecommended ? recLoading : allLoading

    // Extract products array from different response structures
    const products = showRecommended
        ? recommendedData?.products
        : allProducts?.data

    const categories: Array<{ value: ProductCategory; label: string; icon: string }> = [
        { value: "mask", label: "Masks", icon: "😷" },
        { value: "purifier", label: "Air Purifiers", icon: "💨" },
        { value: "plant", label: "Plants", icon: "🌿" },
        { value: "monitor", label: "Monitors", icon: "📊" },
        { value: "supplement", label: "Supplements", icon: "💊" },
    ]

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-emerald-600" />
                    <h1 className="text-3xl font-bold">Eco Marketplace</h1>
                </div>
                <p className="text-gray-600">
                    Products to help you breathe better and live healthier
                </p>
            </header>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>

                    {/* Recommended Toggle */}
                    <button
                        onClick={() => {
                            setShowRecommended(true)
                            setSelectedCategory(undefined)
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showRecommended
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Recommended for You</span>
                        </div>
                    </button>

                    {/* All Products */}
                    <button
                        onClick={() => {
                            setShowRecommended(false)
                            setSelectedCategory(undefined)
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showRecommended && !selectedCategory
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        All Products
                    </button>

                    {/* Category Filters */}
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => {
                                setShowRecommended(false)
                                setSelectedCategory(cat.value)
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showRecommended && selectedCategory === cat.value
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Recommendation Info */}
            {showRecommended && aqiData && (
                <Card className="p-4 bg-emerald-50 border-emerald-200">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-emerald-900">
                                Personalized Recommendations
                            </h3>
                            <p className="text-sm text-emerald-700 mt-1">
                                Based on your current AQI of <strong>{aqiData.aqi}</strong> ({risk} risk),
                                we recommend these products to protect your health.
                            </p>
                            {recommendedData?.categories && (
                                <p className="text-xs text-emerald-600 mt-2">
                                    Recommended categories: {recommendedData.categories.join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Products Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                </div>
            ) : products && products.length > 0 ? (
                <div className="grid gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-600">
                        Try selecting a different category or check back later.
                    </p>
                </Card>
            )}

            {/* Product Count */}
            {products && products.length > 0 && (
                <div className="text-center text-sm text-gray-500 pb-6">
                    Showing {products.length} product{products.length !== 1 ? "s" : ""}
                </div>
            )}
        </div>
    )
}

export const Route = createFileRoute("/products")({
    component: ProductsPage,
})
