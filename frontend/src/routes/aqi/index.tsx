import { createFileRoute } from "@tanstack/react-router"
import { useAQIStore } from "../../stores/aqi.store"

function AQIPage() {
  const aqi = useAQIStore((s) => s.aqi)

  return (
    <div>
      <h2 className="text-xl font-semibold">Current AQI</h2>
      <p className="mt-2 text-3xl">{aqi ?? "No data available"}</p>
    </div>
  )
}

export const Route = createFileRoute("/aqi/")({
  component: AQIPage,
})
