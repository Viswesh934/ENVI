import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface PageLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "emerald" | "blue" | "gradient"
  text?: string
  fullScreen?: boolean
}

export function PageLoader({
  className,
  size = "md",
  variant = "emerald",
  text = "Loading",
  fullScreen = true,
}: PageLoaderProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  const colorMap = {
    default: "text-muted-foreground",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    gradient:
      "text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen",
        className
      )}
    >
      {/* Spinner */}
      <Loader2
        className={cn(
          "animate-spin",
          sizeMap[size],
          variant === "gradient" ? "text-emerald-500" : colorMap[variant]
        )}
      />

      {/* Text */}
      <p
        className={cn(
          "text-sm font-medium tracking-wide",
          variant === "gradient"
            ? "text-muted-foreground"
            : colorMap[variant]
        )}
      >
        {text}
      </p>
    </div>
  )
}
