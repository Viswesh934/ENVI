import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/authHook"
import { useNavigate } from "@tanstack/react-router"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react"

export default function RegisterRoute() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      return
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-3">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Create Account</h2>
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
                disabled={register.isPending}
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
                disabled={register.isPending}
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

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={register.isPending}
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords don't match</p>
            )}
          </div>

          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm"
            type="submit"
            disabled={register.isPending || password !== confirmPassword}
          >
            {register.isPending ? "Creating..." : "Sign Up"}
          </button>

          {register.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <div className="text-xs text-red-700">
                  Failed to create account. Please try again.
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <button
            className="text-sm text-emerald-600 hover:underline font-medium"
            type="button"
            onClick={handleGoToLogin}
            disabled={register.isPending}
          >
            Sign in
          </button>
        </div>
      </Card>
    </div>
  )
}