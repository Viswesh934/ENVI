import { cn } from "@/lib/utils"

type StatusType = "good" | "moderate" | "high"

interface SafetyGaugeProps {
    score: number // 0-100
    level: "safe" | "caution" | "avoid"
    label?: string
    animated?: boolean
    size?: "sm" | "md" | "lg"
    showFactors?: Array<{
        name: string
        status: StatusType
    }>
}

export function SafetyGauge({
    score,
    level,
    label = "Safety Score",
    animated = true,
    size = "md",
    showFactors = [],
}: SafetyGaugeProps) {
    const colors = {
        safe: {
            bg: "from-emerald-400 to-emerald-600",
            text: "text-emerald-700",
            badge: "bg-emerald-100",
            icon: "✓",
            label: "Safe",
        },
        caution: {
            bg: "from-amber-400 to-amber-600",
            text: "text-amber-700",
            badge: "bg-amber-100",
            icon: "⚠",
            label: "Caution",
        },
        avoid: {
            bg: "from-rose-400 to-rose-600",
            text: "text-rose-700",
            badge: "bg-rose-100",
            icon: "✕",
            label: "Avoid",
        },
    }

    const config = colors[level]
    const sizes = {
        sm: { container: "w-24 h-24", text: "text-xl" },
        md: { container: "w-40 h-40", text: "text-4xl" },
        lg: { container: "w-64 h-64", text: "text-6xl" },
    }

    const sizeConfig = sizes[size]

    // Calculate circle circumference for stroke-dasharray
    const circumference = 2 * Math.PI * 45 // r=45
    const strokeDashoffset = circumference * (1 - score / 100)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{label}</h3>
                <div className={cn("px-3 py-1 rounded-full text-sm font-bold", config.badge)}>
                    {score}/100
                </div>
            </div>

            {/* Circular Gauge */}
            <div className={cn("relative mx-auto flex items-center justify-center", sizeConfig.container)}>
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                    />

                    {/* Progress circle with gradient */}
                    <defs>
                        <linearGradient
                            id={`gradient-${level}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor={level === "safe" ? "#34d399" : level === "caution" ? "#fbbf24" : "#f43f5e"}
                            />
                            <stop
                                offset="100%"
                                stopColor={level === "safe" ? "#059669" : level === "caution" ? "#f59e0b" : "#be185d"}
                            />
                        </linearGradient>
                    </defs>

                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={`url(#gradient-${level})`}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: animated ? "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className={cn("font-black leading-none", config.text, sizeConfig.text)}>
                        {Math.round(score)}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {config.label}
                    </div>
                </div>
            </div>

            {/* Risk Factors (if provided) */}
            {showFactors.length > 0 && (
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-600">Risk Factors</p>
                    <div className="space-y-1.5">
                        {showFactors.map((factor, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{factor.name}</span>
                                <span
                                    className={cn(
                                        "font-semibold text-xs uppercase",
                                        factor.status === "good"
                                            ? "text-emerald-600"
                                            : factor.status === "moderate"
                                              ? "text-amber-600"
                                              : "text-rose-600"
                                    )}
                                >
                                    {factor.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
