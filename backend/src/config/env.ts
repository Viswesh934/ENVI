import "dotenv/config"

export const ENV = {
  PORT: Number(process.env.PORT ?? 4000),
  AQI_TOKEN: process.env.AQI_TOKEN!
}

if (!ENV.AQI_TOKEN) {
  throw new Error("AQI_TOKEN missing in env")
}
