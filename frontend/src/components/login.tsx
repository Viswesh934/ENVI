import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/authHook"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginRoute() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  useEffect(() => {
    if (login.data?.success && login.data.data?.token) {
      toast.success("Login successful")
      Cookies.set("token", login.data.data.token, { path: "/" })
      navigate({ to: "/" })
    }
    if (login.error) {
      toast.error("Failed to login. Please try again.")
    }
  }, [login.data, navigate, login.error])

  function handleGoToRegister() {
    navigate({ to: "/auth/register" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-3">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={login.isPending}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={login.isPending}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
            type="submit"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in..." : "Sign in"}
          </button>

          {login.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <div className="text-xs text-red-700">
                  {typeof login.error === 'object' && login.error && 'message' in login.error
                    ? (login.error as { message: string }).message
                    : "Invalid email or password. Please try again."}
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <button
            className="text-sm text-emerald-600 hover:underline font-medium"
            type="button"
            onClick={handleGoToRegister}
            disabled={login.isPending}
          >
            Sign up
          </button>
        </div>
      </Card>
    </div>
  )
}