import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAQIStore } from "../stores/aqi.store"
import { AQICard } from "../components/AQICard"

function Home() {
  const { aqi, loadAQI } = useAQIStore()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      loadAQI(pos.coords.latitude, pos.coords.longitude)
    })
  }, [loadAQI])

  return (
    <div className="flex justify-center">
      {aqi && <AQICard aqi={aqi} />}
    </div>
  )
}

export const Route = createFileRoute("/")({
  component: Home,
})
