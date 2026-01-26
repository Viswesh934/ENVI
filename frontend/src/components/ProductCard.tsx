import { ExternalLink, Star, ShoppingCart } from "lucide-react"
import { Card } from "./ui/card"
import type { EcoProduct } from "@/types/products"

interface ProductCardProps {
    product: EcoProduct
}

export function ProductCard({ product }: ProductCardProps) {
    const categoryIcons: Record<string, string> = {
        mask: "😷",
        purifier: "💨",
        plant: "🌿",
        monitor: "📊",
        supplement: "💊",
    }

    return (
        <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-3xl">
                        {categoryIcons[product.category] || "📦"}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                                {product.name}
                            </h3>
                            {product.brand && (
                                <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                            )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-lg font-bold text-emerald-600">
                                ₹{product.price.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                            ({product.reviewCount.toLocaleString()} reviews)
                        </span>
                    </div>

                    {/* Helps With Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {product.helpsWith.slice(0, 3).map((help) => (
                            <span
                                key={help}
                                className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                            >
                                {help}
                            </span>
                        ))}
                    </div>

                    {/* Action Button */}
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>View Product</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </Card>
    )
}
