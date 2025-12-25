import { createFileRoute } from "@tanstack/react-router"

function About() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">About Envi</h2>
      <p>Envi is a simple air quality tracking app.</p>
    </div>
  )
}

export const Route = createFileRoute("/about")({
  component: About,
})
