import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Check } from "lucide-react"

interface DailyActionItemProps {
    id: string
    icon: string
    title: string
    impact: string
    points: number
    completed?: boolean
    disabled?: boolean
    onToggle?: (id: string, completed: boolean) => void
}

export function DailyActionItem({
    id,
    icon,
    title,
    impact,
    points,
    completed = false,
    disabled = false,
    onToggle,
}: DailyActionItemProps) {
    const [isAnimating, setIsAnimating] = useState(false)

    // Sync with server state
    const [localCompleted, setLocalCompleted] = useState(completed)
    useEffect(() => {
        setLocalCompleted(completed)
    }, [completed])

    const handleToggle = () => {
        if (disabled) return

        setIsAnimating(true)
        const newState = !localCompleted
        setLocalCompleted(newState)
        onToggle?.(id, newState)

        setTimeout(() => setIsAnimating(false), 300)
    }

    return (
        <div
            className={cn(
                "group flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-500",
                "cursor-pointer outline-none",
                disabled && "opacity-60 cursor-not-allowed",
                localCompleted
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50",
                isAnimating && "scale-[0.98]"
            )}
            onClick={handleToggle}
        >
            {/* Custom Checkbox */}
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-500",
                    localCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : "border-gray-200 bg-gray-50",
                    !disabled && !localCompleted && "group-hover:border-emerald-400 group-hover:bg-emerald-50",
                    isAnimating && "scale-110"
                )}
            >
                {localCompleted && (
                    <Check className="h-5 w-5 animate-in zoom-in-50 duration-300 stroke-[3]" />
                )}
            </div>

            {/* Icon & Content */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className={cn(
                    "text-3xl transition-transform duration-500",
                    localCompleted ? "scale-90 grayscale opacity-50" : "group-hover:scale-110"
                )}>{icon}</span>
                <div className="flex-1 min-w-0">
                    <p
                        className={cn(
                            "text-base font-bold transition-all duration-300 leading-tight",
                            localCompleted
                                ? "text-gray-400 line-through"
                                : "text-gray-900"
                        )}
                    >
                        {title}
                    </p>
                    <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{impact}</p>
                </div>
            </div>

            {/* Points badge */}
            <div
                className={cn(
                    "shrink-0 rounded-xl px-3 py-1.5 text-xs font-black tracking-wider transition-all duration-500 uppercase",
                    localCompleted
                        ? "bg-gray-100 text-gray-500"
                        : "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200"
                )}
            >
                +{points} pts
            </div>
        </div>
    )
}
