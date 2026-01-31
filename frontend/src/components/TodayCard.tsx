import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeWindowBlock } from "./TimeWindowBlock"
import { DailyActionItem } from "./DailyActionItem"
import { useTodayActions, useCompleteAction, useChallengeStatus, getCurrentPeriod } from "@/hooks/useTodayActions"
import { MapPin, Sparkles, Flame, Trophy, RefreshCcw, AlertTriangle, Lightbulb, Timer } from "lucide-react"

const levelConfig = {
    safe: {
        bg: "from-emerald-50 to-white",
        border: "border-emerald-200",
        badge: "bg-emerald-500 text-white",
        glow: "shadow-emerald-500/10",
        accent: "text-emerald-600",
        iconContainer: "bg-emerald-100/50"
    },
    caution: {
        bg: "from-amber-50 to-white",
        border: "border-amber-200",
        badge: "bg-amber-500 text-white",
        glow: "shadow-amber-500/10",
        accent: "text-amber-600",
        iconContainer: "bg-amber-100/50"
    },
    avoid: {
        bg: "from-rose-50 to-white",
        border: "border-rose-200",
        badge: "bg-rose-500 text-white",
        glow: "shadow-rose-500/10",
        accent: "text-rose-600",
        iconContainer: "bg-rose-100/50"
    },
}

const alertConfig = {
    low: { bg: "bg-blue-50 border-blue-100", icon: "bg-blue-100 text-blue-600" },
    moderate: { bg: "bg-amber-50 border-amber-100", icon: "bg-amber-100 text-amber-600" },
    high: { bg: "bg-red-50 border-red-100", icon: "bg-red-100 text-red-600" },
}

const difficultyConfig = {
    easy: { badge: "bg-emerald-100 text-emerald-700", label: "Easy" },
    medium: { badge: "bg-amber-100 text-amber-700", label: "Medium" },
    hard: { badge: "bg-rose-100 text-rose-700", label: "Hard" },
}

interface TodayCardProps {
    location?: string
}

export function TodayCard({ location }: TodayCardProps) {
    const { data, isLoading, error, isFetching, refresh } = useTodayActions({ location })
    const completeAction = useCompleteAction()
    const challengeStatus = useChallengeStatus()

    const handleActionToggle = (actionId: string, completed: boolean, points: number) => {
        completeAction.mutate({ actionId, points, completed })
    }

    const handleChallengeAccept = () => {
        if (!data?.dailyChallenge) return
        challengeStatus.mutate({
            accepted: true,
            completed: false,
            bonusPoints: data.dailyChallenge.bonusPoints,
        })
    }

    const handleChallengeComplete = () => {
        if (!data?.dailyChallenge) return
        challengeStatus.mutate({
            accepted: true,
            completed: true,
            bonusPoints: data.dailyChallenge.bonusPoints,
        })
    }

    const currentPeriod = getCurrentPeriod()

    // Get data from server
    const userActivity = data?.userActivity
    const completedActions = userActivity?.completedActions || []
    const totalPoints = userActivity?.totalPoints || 0
    const streak = userActivity?.streak || 0
    const challengeAccepted = userActivity?.challengeAccepted || false
    const challengeCompleted = userActivity?.challengeCompleted || false

    const totalActions = data?.dailyActions?.length || 0
    const completedCount = completedActions.length
    const progressPercent = totalActions > 0 ? (completedCount / totalActions) * 100 : 0

    // Loading state
    if (isLoading) {
        return (
            <Card className="rounded-3xl border-2 border-gray-100 bg-white p-8 shadow-xl">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-48" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-32 rounded-2xl" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                    </div>
                </div>
            </Card>
        )
    }

    if (!data) return null

    const config = levelConfig[data.heroAction?.level || "safe"]

    return (
        <div className="space-y-8">
            {/* Page Header Vibe */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Today's Eco Pulse</h1>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 font-medium">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        <span>{data.location}</span>
                        <span className="text-gray-300">•</span>
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        <span>Hyper-local AI</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Streak */}
                    <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2 border-2 border-orange-100">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-orange-600 tracking-wider leading-none">Streak</p>
                            <p className="text-lg font-black text-orange-700 leading-tight">{streak} Days</p>
                        </div>
                    </div>

                    {/* Total Points */}
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 border-2 border-emerald-100">
                        <Trophy className="h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider leading-none">Balance</p>
                            <p className="text-lg font-black text-emerald-700 leading-tight">{totalPoints} pts</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refresh}
                        disabled={isFetching}
                        className="h-12 w-12 rounded-2xl bg-gray-50 hover:bg-white border-2 border-gray-100 transition-all hover:shadow-md"
                    >
                        <RefreshCcw className={cn("h-5 w-5 text-gray-600", isFetching && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <Card className={cn(
                "relative overflow-hidden rounded-[2.5rem] border-2 p-8 shadow-2xl transition-all",
                config.border,
                "bg-gradient-to-br",
                config.bg,
                config.glow
            )}>
                {/* Decorative orbs */}
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />

                <div className="relative space-y-10">
                    {/* Environmental Alert Banner */}
                    {data.environmentalAlert && (
                        <div className={cn(
                            "flex items-center gap-4 rounded-3xl border-2 p-5 animate-in slide-in-from-top-4 duration-500",
                            alertConfig[data.environmentalAlert.severity].bg,
                            alertConfig[data.environmentalAlert.severity].bg.replace('bg-', 'border-').replace('50', '200')
                        )}>
                            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm", alertConfig[data.environmentalAlert.severity].icon)}>
                                {data.environmentalAlert.icon}
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-0.5">Alert Level: {data.environmentalAlert.severity}</h4>
                                <p className="text-lg font-bold text-gray-800 leading-tight">{data.environmentalAlert.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{data.environmentalAlert.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Hero Action Header */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold border border-gray-100 backdrop-blur-sm">
                                <span className={cn("h-2 w-2 rounded-full animate-pulse",
                                    data.heroAction.level === 'safe' ? 'bg-emerald-500' :
                                        data.heroAction.level === 'caution' ? 'bg-amber-500' : 'bg-rose-500'
                                )} />
                                {data.heroAction.level.toUpperCase()} STATUS
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1]">
                                {data.heroAction.title}
                            </h2>
                            <p className="text-lg text-gray-600 font-medium">
                                {data.heroAction.subtitle}
                            </p>
                        </div>
                        <div className="flex justify-center lg:justify-end">
                            <div className={cn(
                                "h-48 w-48 rounded-[3rem] flex items-center justify-center text-8xl shadow-2xl transition-transform hover:scale-105 duration-500",
                                config.iconContainer,
                                "border-4 border-white"
                            )}>
                                {data.heroAction.icon}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Progress & Goals Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Daily Missions</h3>
                                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    {completedCount}/{totalActions} Completed
                                </span>
                            </div>

                            {/* Custom progress bar */}
                            <div className="relative h-4 w-full rounded-full bg-gray-100 overflow-hidden p-1 border border-gray-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out shadow-sm"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.dailyActions.map((action) => (
                                    <DailyActionItem
                                        key={action.id}
                                        {...action}
                                        completed={completedActions.includes(action.id)}
                                        onToggle={(id, completed) => handleActionToggle(id, completed, action.points)}
                                        disabled={completeAction.isPending}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Column: Windows & Tips */}
                        <div className="space-y-8">
                            {/* Time Windows */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Timer className="h-5 w-5 text-gray-400" />
                                    Active Windows
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {data.timeWindows.map((window) => (
                                        <TimeWindowBlock
                                            key={window.period}
                                            {...window}
                                            isActive={window.period === currentPeriod}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Eco Tip */}
                            <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 p-6 space-y-4">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold uppercase tracking-widest text-xs">
                                    <Lightbulb className="h-4 w-4" />
                                    Pro Tip
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 leading-tight">{data.ecoTip.title}</h4>
                                    <p className="text-sm text-gray-600 mt-2">{data.ecoTip.description}</p>
                                </div>
                                {data.ecoTip.source && (
                                    <div className="pt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                        Source: {data.ecoTip.source}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Daily Challenge - Wide Footer */}
                    {data.dailyChallenge && (
                        <div
                            className={cn(
                                "rounded-[2.5rem] border-2 border-dashed p-8 transition-all hover:scale-[1.01] duration-300",
                                challengeCompleted
                                    ? "border-emerald-400 bg-emerald-100/50 shadow-lg shadow-emerald-100"
                                    : "border-purple-300 bg-purple-50/50"
                            )}
                        >
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="h-24 w-24 shrink-0 rounded-[2rem] bg-white flex items-center justify-center text-6xl shadow-xl">
                                    {data.dailyChallenge.icon}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-gray-900">
                                            {data.dailyChallenge.title}
                                        </h3>
                                        <span className={cn("rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest", difficultyConfig[data.dailyChallenge.difficulty].badge)}>
                                            {difficultyConfig[data.dailyChallenge.difficulty].label} Difficulty
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-600 font-medium mb-6">
                                        {data.dailyChallenge.description}
                                    </p>
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex items-center gap-2 text-purple-600 font-black text-xl">
                                            <Sparkles className="h-6 w-6" />
                                            +{data.dailyChallenge.bonusPoints} Points
                                        </div>
                                        {!challengeCompleted && (
                                            <Button
                                                size="lg"
                                                variant={challengeAccepted ? "outline" : "default"}
                                                className={cn(
                                                    "h-14 px-10 rounded-2xl text-lg font-bold transition-all shadow-lg",
                                                    !challengeAccepted && "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                                                )}
                                                onClick={challengeAccepted ? handleChallengeComplete : handleChallengeAccept}
                                                disabled={challengeStatus.isPending}
                                            >
                                                {challengeAccepted ? "Finish Now" : "Accept Mission"}
                                            </Button>
                                        )}
                                        {challengeCompleted && (
                                            <div className="flex items-center gap-2 text-emerald-600 font-black text-xl">
                                                <Trophy className="h-6 w-6" />
                                                MISSION ACCOMPLISHED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nearby Green Space */}
                    {data.nearbyGreenSpace && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-white p-6 shadow-md transition-all hover:shadow-lg">
                                <div className="h-16 w-16 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center text-4xl">
                                    🌳
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Closest Greenery</p>
                                    <h4 className="text-lg font-bold text-gray-900">{data.nearbyGreenSpace.name}</h4>
                                    <p className="text-sm text-gray-500">{data.nearbyGreenSpace.distance} • Tree Index: {data.nearbyGreenSpace.treeIndex?.toFixed(1) || "N/A"}</p>
                                </div>
                            </div>

                            {/* Air Quality Mini Info */}
                            <div className="flex items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-white p-6 shadow-md transition-all hover:shadow-lg">
                                <div className="h-16 w-16 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center text-4xl">
                                    🌬️
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Ambient Quality</p>
                                    <h4 className="text-lg font-bold text-gray-900">{data.nearbyGreenSpace.airQuality}</h4>
                                    <p className="text-sm text-gray-500">Based on local sensor network</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
