import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "./api-request"
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

export interface ActivityRecommendationRequest {
    activity: "walking" | "running" | "cycling" | "kids-play"
    timeWindow?: "morning" | "afternoon" | "evening" | "night"
    location?: {
        city: string
        lat: number
        lon: number
    }
}

export interface TimeWindowData {
    period: string
    label: string
    aqi: number
    temperature: number
    uvIndex: number
    isBestTime: boolean
    safetyScore: number
}

export interface ActivityRecommendationResponse {
    success: boolean
    safetyScore: number
    advice: {
        level: "safe" | "caution" | "avoid"
        message: string
        reasoning: string
    }
    timeWindows: TimeWindowData[]
    alternativeActivities: Array<{
        name: string
        safetyScore: number
        reason: string
    }>
    historicalContext: {
        bestDayThisMonth: string
        worstDayThisMonth: string
        averageAQI: number
        similarDaysCount: number
    }
    environmental?: {
        aqi: number
        temperature: number
        humidity: number
        windSpeed: number
        uvIndex: number
        pollutants: {
            pm25: number
            pm10: number
            no2: number
            co: number
            o3: number
            so2: number
        }
    }
}

/**
 * Hook to get comprehensive activity recommendation
 */
export function useActivityRecommendation(
    request: ActivityRecommendationRequest,
    enabled: boolean = true
) {
    const userId = getUserId()

    return useQuery({
        queryKey: ["activityRecommendation", userId, request.activity, request.timeWindow],
        queryFn: async () => {
            const response = await apiRequest.post<ActivityRecommendationResponse>(
                "/advisor/activity-recommendation",
                {
                    userId,
                    ...request,
                }
            )
            return response.data
        },
        enabled: !!userId && enabled,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    })
}
