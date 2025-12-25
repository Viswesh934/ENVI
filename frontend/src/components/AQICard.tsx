type Props = {
  aqi: number
}

function getAQIStyles(aqi: number) {
  if (aqi <= 50)
    return {
      bg: "bg-green-500",
      label: "Good"
    }

  if (aqi <= 100)
    return {
      bg: "bg-yellow-400",
      label: "Moderate"
    }

  if (aqi <= 150)
    return {
      bg: "bg-orange-400",
      label: "Unhealthy for Sensitive Groups"
    }

  if (aqi <= 200)
    return {
      bg: "bg-red-500",
      label: "Unhealthy"
    }

  return {
    bg: "bg-purple-700",
    label: "Very Unhealthy"
  }
}

export function AQICard({ aqi }: Props) {
  const { bg, label } = getAQIStyles(aqi)

  return (
    <div
      className={`w-64 rounded-2xl px-8 py-6 text-center text-white shadow-xl ${bg}`}
    >
      <div className="text-6xl font-extrabold">{aqi}</div>

      <div className="mt-2 text-xs uppercase tracking-widest opacity-90">
        Air Quality Index
      </div>

      <div className="mt-1 text-base font-medium">
        {label}
      </div>
    </div>
  )
}
