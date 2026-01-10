import { createFileRoute } from '@tanstack/react-router'
import RegisterRoute from "@/components/register"

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RegisterRoute />;
}
