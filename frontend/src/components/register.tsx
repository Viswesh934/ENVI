import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/authHook"
import { useNavigate } from "@tanstack/react-router"

export default function RegisterRoute() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    register.mutate({ email, password })
  }

  function handleGoToLogin() {
    navigate({ to: "/auth/login" })
  }

  useEffect(() => {
    if (register.data?.success) {
      navigate({ to: "/auth/login" })
    }
  }, [register.data, navigate])

  return (
    <Card className="max-w-sm mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          className="border rounded px-2 py-1"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={register.isPending}
        />
        <input
          className="border rounded px-2 py-1"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={register.isPending}
        />
        <button
          className="mt-2 bg-emerald-500 text-white rounded px-3 py-1 disabled:opacity-50"
          type="submit"
          disabled={register.isPending}
        >
          Sign Up
        </button>
        {register.data?.success && (
          <div className="text-green-600 text-sm mt-1">Signup successful!</div>
        )}
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-muted-foreground">Already have an account?</span>
        <button
          className="ml-2 text-emerald-600 hover:underline"
          type="button"
          onClick={handleGoToLogin}
          disabled={register.isPending}
        >
          Login
        </button>
      </div>
    </Card>
  )
}