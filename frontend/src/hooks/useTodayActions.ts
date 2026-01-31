import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "./api-request"

// Types matching backend response
export interface HeroAction {
    icon: string
    title: string
    subtitle: string
    level: "safe" | "caution" | "avoid"
}

export interface TimeWindow {
    period: "morning" | "afternoon" | "evening"
    label: string
    status: "safe" | "caution" | "avoid"
    reason: string
}

export interface DailyAction {
    id: string
    icon: string
    title: string
    impact: string
    points: number
}

export interface NearbyGreenSpace {
    name: string
    distance: string
    treeIndex: number
    airQuality: string
}

export interface EcoTip {
    icon: string
    title: string
    description: string
    source?: string
}

export interface EnvironmentalAlert {
    type: "aqi" | "weather" | "uv" | "pollen" | "none"
    severity: "low" | "moderate" | "high"
    title: string
    description: string
    icon: string
}

export interface DailyChallenge {
    id: string
    icon: string
    title: string
    description: string
    bonusPoints: number
    difficulty: "easy" | "medium" | "hard"
}

export interface UserActivityStats {
    totalPoints: number
    streak: number
    completedActions: string[]
    challengeAccepted: boolean
    challengeCompleted: boolean
    quizScore: number
}

export interface TodayActionsResponse {
    heroAction: HeroAction
    timeWindows: TimeWindow[]
    dailyActions: DailyAction[]
    nearbyGreenSpace: NearbyGreenSpace | null
    ecoTip: EcoTip
    environmentalAlert: EnvironmentalAlert | null
    dailyChallenge: DailyChallenge
    generatedAt: string
    location: string
    userActivity: UserActivityStats
}

export interface UseTodayActionsOptions {
    location?: string
    enabled?: boolean
}

/**
 * Custom hook to fetch today's eco-actions
 */
export function useTodayActions(options: UseTodayActionsOptions = {}) {
    const { location, enabled = true } = options
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ["todayActions", location],
        queryFn: async () => {
            const url = location
                ? `/today/actions/${encodeURIComponent(location)}`
                : `/today/actions`

            const response = await apiRequest.get<TodayActionsResponse & { success: boolean }>(url)

            if (!response.success || !response.data) {
                throw new Error(response.error || "Failed to fetch today's actions")
            }

            return response.data
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000,
        retry: 2,
    })

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["todayActions"] })
    }

    return {
        ...query,
        refresh,
    }
}

/**
 * Hook for completing/uncompleting actions
 */
export function useCompleteAction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ actionId, points, completed }: {
            actionId: string
            points: number
            completed: boolean
        }) => {
            const response = await apiRequest.post<{
                success: boolean
            } & UserActivityStats>("/today/complete", { actionId, points, completed })

            if (!response.success) {
                throw new Error(response.error || "Failed to complete action")
            }

            return response.data
        },
        onSuccess: (data) => {
            // Update the cache with new activity stats
            queryClient.setQueryData<TodayActionsResponse>(["todayActions", undefined], (old) => {
                if (!old || !data) return old
                return {
                    ...old,
                    userActivity: data,
                }
            })
        },
    })
}

/**
 * Hook for challenge status
 */
export function useChallengeStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ accepted, completed, bonusPoints }: {
            accepted: boolean
            completed: boolean
            bonusPoints: number
        }) => {
            const response = await apiRequest.post<{
                success: boolean
            } & UserActivityStats>("/today/challenge", { accepted, completed, bonusPoints })

            if (!response.success) {
                throw new Error(response.error || "Failed to update challenge")
            }

            return response.data
        },
        onSuccess: (data) => {
            queryClient.setQueryData<TodayActionsResponse>(["todayActions", undefined], (old) => {
                if (!old || !data) return old
                return {
                    ...old,
                    userActivity: data,
                }
            })
        },
    })
}

/**
 * Get current time period
 */
export function getCurrentPeriod(): "morning" | "afternoon" | "evening" | "night" {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "morning"
    if (hour >= 12 && hour < 17) return "afternoon"
    if (hour >= 17 && hour < 21) return "evening"
    return "night"
}

/**
 * Get activity status label
 */
export function getActivityStatusLabel(status: "safe" | "caution" | "avoid"): string {
    switch (status) {
        case "safe":
            return "Good to go"
        case "caution":
            return "Use caution"
        case "avoid":
            return "Stay indoors"
    }
}

