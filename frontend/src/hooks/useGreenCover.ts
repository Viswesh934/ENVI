import { useQuery } from "@tanstack/react-query"
import apiRequest, { ApiRequest } from "./api-request"
import type { GreenCoverReport } from "@/types/green"

export const useGreenCover = (location?: string, lat?: number, lng?: number) => {
    return useQuery({
        queryKey: ["green-cover", location, lat, lng],
        queryFn: async () => {
            if (!location) return null

            const params = new URLSearchParams()
            params.append("location", location)
            if (lat) params.append("lat", lat.toString())
            if (lng) params.append("lng", lng.toString())

            const { data } = await apiRequest.get<GreenCoverReport>("/green", { params })
            return data
        },
        enabled: !!location, // Only fetch if location is provided
        staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (data doesn't change fast)
    })
}
