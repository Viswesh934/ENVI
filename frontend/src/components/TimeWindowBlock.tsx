import { cn } from "@/lib/utils"
import { Sun, Moon, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

type Status = "safe" | "caution" | "avoid"

interface TimeWindowBlockProps {
    period: "morning" | "afternoon" | "evening"
    label: string
    status: Status
    reason: string
    isActive?: boolean
}

const statusConfig: Record<Status, { bg: string; border: string; icon: any; text: string; label: string }> = {
    safe: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: CheckCircle2,
        text: "text-emerald-700",
        label: "GO"
    },
    caution: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: AlertCircle,
        text: "text-amber-700",
        label: "LIMIT"
    },
    avoid: {
        bg: "bg-rose-50",
        border: "border-rose-200",
        icon: XCircle,
        text: "text-rose-700",
        label: "AVOID"
    },
}

const periodIcons: Record<string, string> = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌆",
}

export function TimeWindowBlock({
    period,
    label,
    status,
    reason,
    isActive = false,
}: TimeWindowBlockProps) {
    const config = statusConfig[status]
    const StatusIcon = config.icon

    return (
        <div
            className={cn(
                "relative group flex flex-col items-center rounded-2xl border-2 p-4 transition-all duration-500",
                "hover:shadow-lg hover:scale-[1.02]",
                isActive ? "bg-white border-emerald-400 shadow-xl shadow-emerald-100" : "bg-white border-gray-100",
            )}
        >
            {/* Active indicator */}
            {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-3 py-1 rounded-full shadow-lg">
                        NOW
                    </span>
                </div>
            )}

            {/* Period icon */}
            <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center text-3xl mb-3 transition-transform duration-500 group-hover:scale-110",
                isActive ? "bg-emerald-50" : "bg-gray-50"
            )}>
                {periodIcons[period]}
            </div>

            {/* Content */}
            <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {period}
                </p>
                <p className="text-sm font-bold text-gray-900 leading-none">{label}</p>
            </div>

            {/* Status Badge */}
            <div className={cn(
                "mt-4 flex items-center gap-1.5 rounded-lg px-2 py-1 border-2 w-full justify-center transition-all duration-500",
                config.bg,
                config.border,
                config.text
            )}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black tracking-widest">
                    {config.label}
                </span>
            </div>

            {/* Tooltip-like reason */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 z-0 pointer-events-none group-hover:pointer-events-auto">
                <p className="text-xs font-semibold text-gray-700 leading-tight">
                    {reason}
                </p>
            </div>
        </div>
    )
}
