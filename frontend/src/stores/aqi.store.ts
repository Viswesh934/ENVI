import { create } from "zustand"

type AQIState = {
  aqi: number | null
  loading: boolean
  error: string | null
  loadAQI: (lat: number, lon: number) => Promise<void>
}

export const useAQIStore = create<AQIState>((set) => ({
  aqi: null,
  loading: false,
  error: null,

  loadAQI: async (lat, lon) => {
    set({ loading: true, error: null })

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/aqi?lat=${lat}&lon=${lon}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch AQI")
      }

      const data = await res.json()

      set({
        aqi: data.aqi,
        loading: false
      })
    } catch{
      set({
        error: "Unable to load air quality data",
        loading: false
      })
    }
  }
}))
