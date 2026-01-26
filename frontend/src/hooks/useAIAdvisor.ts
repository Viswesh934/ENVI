import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "./api-request"
import type { RiskLevel } from "@/types/products"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

interface JWTPayload {
    userId: string
    email: string
}

function getUserId(): string | null {
    const token = Cookies.get("token")
    if (!token) return null

    try {
        const decoded = jwtDecode<JWTPayload>(token)
        return decoded.userId
    } catch {
        return null
    }
}

interface AdvisorRequest {
    aqi: number
    pm25?: number
    pm10?: number
    no2?: number
    plan?: string
    symptoms?: string[]
    location?: { city: string; lat: number; lon: number }
    weather?: string
    temperature?: number
}

interface AdvisorResponse {
    success: boolean
    advice: string
    risk: RiskLevel
    healthImpacts: string[]
    similarDays: Array<{
        date: string
        summary: string
        aqi: number
    }>
}

/**
 * Hook to get AI health advice based on current AQI
 */
export function useAIAdvisor(request: AdvisorRequest) {
    const userId = getUserId()

    return useQuery({
        queryKey: ["advisor", userId, request.aqi, request.pm25],
        queryFn: async () => {
            const response = await apiRequest.post<AdvisorResponse>("/advisor/advice", {
                userId,
                today: {
                    userId,
                    date: new Date().toISOString().split("T")[0],
                    ...request,
                },
            })
            return response.data
        },
        enabled: !!userId && !!request.aqi,
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
    })
}

/**
 * Hook to get quick risk assessment
 */
export function useRiskCheck(aqi: number, pm25?: number) {
    return useQuery({
        queryKey: ["risk", aqi, pm25],
        queryFn: async () => {
            const response = await apiRequest.post<{
                success: boolean
                risk: RiskLevel
                healthImpacts: string[]
            }>("/api/advisor/risk", {
                aqi,
                pm25,
            })
            return response.data
        },
        enabled: !!aqi,
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}
