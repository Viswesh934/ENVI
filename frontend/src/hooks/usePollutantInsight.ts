import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "./api-request"

export interface PollutantInsightRequest {
    pollutant: string
    value: number
    cityName: string
    aqi: number
    allPollutants: {
        [key: string]: number
    }
}

export interface PollutantInsightResponse {
    pollutant: string
    cityName: string
    insight: string
    cached: boolean
}

/**
 * Custom hook to fetch AI-generated insights for a specific pollutant
 * Uses React Query with aggressive caching (24 hours) to minimize API calls
 * 
 * @param data - Pollutant data including value, city, and all pollutants
 * @param enabled - Whether to fetch the data
 * @returns React Query result with insight data
 */
export function usePollutantInsight(
    data: PollutantInsightRequest | null,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ["pollutant-insight", data?.pollutant, data?.value, data?.cityName],
        queryFn: async () => {
            if (!data) {
                throw new Error("No data provided")
            }

            const response = await apiRequest.post<PollutantInsightResponse>(
                "/gemini/pollutant-insight",
                data
            )

            if (!response.success || !response.data) {
                throw new Error(response.error || "Failed to fetch pollutant insight")
            }

            return response.data
        },
        enabled: enabled && !!data,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours - data rarely changes
        gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - keep in cache for a week
        retry: 1, // Only retry once to avoid wasting API calls
    })
}
