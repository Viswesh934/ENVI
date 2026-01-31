import { useMutation } from "@tanstack/react-query"
import { apiRequest, type ApiResponse } from "./api-request"

interface LoginRequest {
  email: string
  password: string
}
interface LoginResponse {
  token: string
}

interface RegisterRequest {
  email: string
  password: string
  location?: string
}
interface RegisterResponse {
  success: boolean
}

export function useAuth() {
  const login = useMutation<ApiResponse<LoginResponse>, unknown, LoginRequest>({
    mutationFn: (body) => apiRequest.post<LoginResponse, LoginRequest>("/auth/login", body),
  })

  const register = useMutation<ApiResponse<RegisterResponse>, unknown, RegisterRequest>({
    mutationFn: (body) => apiRequest.post<RegisterResponse, RegisterRequest>("/auth/register", body),
  })

  return { login, register }
}