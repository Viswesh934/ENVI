import { ENV } from "../config/env"

export async function fetchAQI(lat: string, lon: string) {
  const res = await fetch(
    `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${ENV.AQI_TOKEN}`
  )

  const json = await res.json()

  if (json.status !== "ok") {
    throw new Error("AQI fetch failed")
  }

  return json.data
}
