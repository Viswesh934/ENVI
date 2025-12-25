import { createFileRoute } from "@tanstack/react-router"

function CityAQI() {
  const { city } = Route.useParams()

  return (
    <div>
      <h2 className="text-xl font-semibold">
        AQI for {city}
      </h2>
    </div>
  )
}

export const Route = createFileRoute("/aqi/$city")({
  component: CityAQI,
})
