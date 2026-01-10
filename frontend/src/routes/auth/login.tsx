import { createFileRoute } from '@tanstack/react-router'
import LoginRoute from "@/components/login"

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginRoute />;
}
