import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "./api-request"

export interface AQIResponse {
    aqi: number
    idx: number
    attributions: Array<{
        url: string
        name: string
        logo?: string
    }>
    city: {
        geo: [number, number]
        name: string
        url: string
    }
    dominentpol: string
    iaqi: {
        [key: string]: {
            v: number
        }
    }
    time: {
        s: string
        tz: string
        v: number
        iso: string
    }
    forecast?: {
        daily: {
            [key: string]: Array<{
                avg: number
                day: string
                max: number
                min: number
            }>
        }
    }
    debug?: {
        sync: string
    }
}

export interface UseAQIOptions {
    latitude: number
    longitude: number
    enabled?: boolean
}

/**
 * Custom hook to fetch AQI data based on coordinates
 * Uses React Query for caching and automatic refetching
 * 
 * @param options - Options including latitude, longitude, and enabled flag
 * @returns React Query result with AQI data
 * 
 * @example
 * const { data, isLoading, error } = useAQI({ 
 *   latitude: 28.6139, 
 *   longitude: 77.2090 
 * })
 */
export function useAQI({ latitude, longitude, enabled = true }: UseAQIOptions) {
    return useQuery({
        queryKey: ["aqi", latitude, longitude],
        queryFn: async () => {
            const response = await apiRequest.get<AQIResponse>(
                `/aqi?lat=${latitude}&lon=${longitude}`
            )

            if (!response.success || !response.data) {
                throw new Error(response.error || "Failed to fetch AQI data")
            }

            return response.data
        },
        enabled: enabled && !!latitude && !!longitude,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 2,
    })
}

/**
 * Helper function to get AQI status based on AQI value
 * Based on US EPA AQI standards
 */
export function getAQIStatus(aqi: number): {
    status: string
    level: "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous"
    color: string
    advice: string
} {
    if (aqi <= 50) {
        return {
            status: "Good",
            level: "good",
            color: "text-green-600",
            advice: "Air quality is satisfactory, and air pollution poses little or no risk.",
        }
    } else if (aqi <= 100) {
        return {
            status: "Moderate",
            level: "moderate",
            color: "text-yellow-600",
            advice: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
        }
    } else if (aqi <= 150) {
        return {
            status: "Unhealthy for Sensitive Groups",
            level: "unhealthy-sensitive",
            color: "text-orange-600",
            advice: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
        }
    } else if (aqi <= 200) {
        return {
            status: "Unhealthy",
            level: "unhealthy",
            color: "text-red-600",
            advice: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
        }
    } else if (aqi <= 300) {
        return {
            status: "Very Unhealthy",
            level: "very-unhealthy",
            color: "text-purple-600",
            advice: "Health alert: The risk of health effects is increased for everyone.",
        }
    } else {
        return {
            status: "Hazardous",
            level: "hazardous",
            color: "text-red-900",
            advice: "Health warning of emergency conditions: everyone is more likely to be affected.",
        }
    }
}
