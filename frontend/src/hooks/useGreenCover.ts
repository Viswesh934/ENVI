import { useQuery } from "@tanstack/react-query"
import apiRequest, { ApiRequest } from "./api-request"
import type { GreenCoverReport } from "@/types/green"

export const useGreenCover = (location: string | null) => {
    return useQuery({
        queryKey: ["green-cover", location],
        queryFn: async () => {
            // If no location provided, call without params (backend will use user's registered location)
            const params = location ? { params: { location } } : undefined
            const { data } = await apiRequest.get<GreenCoverReport>("/green", params)
            return data
        },
        enabled: true, // Always enabled - backend uses user's location from JWT if not provided
        staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (data doesn't change fast)
    })
}

