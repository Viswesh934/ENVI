import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "./api-request"
import type { EcoProduct, RiskLevel, ProductCategory } from "@/types/products"

/**
 * Hook to get all products (optionally filtered by category)
 */
export function useProducts(category?: ProductCategory, page: number = 1, limit: number = 5) {
    return useQuery({
        queryKey: ["products", category, page, limit],
        queryFn: async () => {
            const url = category
                ? `/marketplace/products?category=${category}&page=${page}&limit=${limit}`
                : `/marketplace/products?page=${page}&limit=${limit}`

            interface PaginatedResponse {
                success: boolean
                data: EcoProduct[]
                total: number
                page: number
                limit: number
                totalPages: number
            }

            const response = await apiRequest.get<PaginatedResponse>(url)
            return response.data
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    })
}

/**
 * Hook to get recommended products based on risk
 */
export function useRecommendedProducts(risk: RiskLevel, pm25?: number, hasSymptoms?: boolean) {
    return useQuery({
        queryKey: ["products", "recommended", risk, pm25, hasSymptoms],
        queryFn: async () => {
            const response = await apiRequest.post<{
                success: boolean
                data: EcoProduct[]
                categories: ProductCategory[]
                count: number
            }>("/marketplace/recommended", {
                risk,
                pm25,
                hasSymptoms,
            })
            return {
                products: response.data?.data || [],
                categories: (response.data as any)?.categories || [],
            }
        },
        enabled: !!risk,
        staleTime: 1000 * 60 * 30, // 30 minutes
    })
}
