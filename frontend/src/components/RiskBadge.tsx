import type { RiskLevel } from "@/types/products"

interface RiskBadgeProps {
    risk: RiskLevel
    size?: "sm" | "md" | "lg"
}

export function RiskBadge({ risk, size = "md" }: RiskBadgeProps) {
    const colors = {
        Low: "bg-green-100 text-green-800 border-green-200",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        High: "bg-orange-100 text-orange-800 border-orange-200",
        Severe: "bg-red-100 text-red-800 border-red-200",
    }

    const sizes = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-2",
    }

    return (
        <span
            className={`inline-flex items-center font-semibold rounded-full border ${colors[risk]} ${sizes[size]}`}
        >
            {risk} Risk
        </span>
    )
}
