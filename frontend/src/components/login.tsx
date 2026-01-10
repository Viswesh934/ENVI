import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/authHook"
import { useNavigate } from "@tanstack/react-router"
import Cookies from "js-cookie"

export default function LoginRoute() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  useEffect(() => {
    if (login.data?.success && login.data.data?.token) {
      Cookies.set("token", login.data.data.token, { path: "/" })
      navigate({ to: "/" })
    }
  }, [login.data, navigate])

  function handleGoToRegister() {
    navigate({ to: "/auth/register" })
  }

  return (
    <Card className="max-w-sm mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          className="border rounded px-2 py-1"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={login.isPending}
        />
        <input
          className="border rounded px-2 py-1"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={login.isPending}
        />
        <button
          className="mt-2 bg-emerald-500 text-white rounded px-3 py-1 disabled:opacity-50"
          type="submit"
          disabled={login.isPending}
        >
          Login
        </button>
        {login.data?.success && (
          <div className="text-green-600 text-sm mt-1">Login successful!</div>
        )}
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-muted-foreground">Don't have an account?</span>
        <button
          className="ml-2 text-emerald-600 hover:underline"
          type="button"
          onClick={handleGoToRegister}
          disabled={login.isPending}
        >
          Sign Up
        </button>
      </div>
    </Card>
  )
}