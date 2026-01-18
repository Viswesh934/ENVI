import "dotenv/config"

export const ENV = {
  PORT: Number(process.env.PORT ?? 4000),
  AQI_TOKEN: process.env.AQI_TOKEN!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!
}

if (!ENV.AQI_TOKEN) {
  throw new Error("AQI_TOKEN missing in env")
}

if (!ENV.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing in env")
}
