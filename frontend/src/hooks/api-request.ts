import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  AxiosError,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export class ApiRequest {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    // Optional: generic response interceptor (no auth handling)
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => Promise.reject(error)
    );
  }

  /**
   * Normalizes API responses into ApiResponse<T>
   */
  private async handleResponse<T>(
    promise: Promise<{ data: T }>
  ): Promise<ApiResponse<T>> {
    try {
      const { data } = await promise;
      return { success: true, data };
    } catch (error) {
      const err = error as AxiosError;
      const responseData = err.response?.data as ApiErrorResponse | undefined;

      const errorField =
        responseData?.error || err.message || "Unknown error";
      const messageField = responseData?.message;

      if (import.meta.env.DEV) {
        console.log("API Error:", {
          status: err.response?.status,
          data: err.response?.data,
        });
      }

      return {
        success: false,
        error: errorField,
        message: messageField,
      };
    }
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.handleResponse<T>(this.axiosInstance.get<T>(url, config));
  }

  post<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ) {
    return this.handleResponse<T>(
      this.axiosInstance.post<T>(url, body, config)
    );
  }

  put<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ) {
    return this.handleResponse<T>(
      this.axiosInstance.put<T>(url, body, config)
    );
  }

  patch<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ) {
    return this.handleResponse<T>(
      this.axiosInstance.patch<T>(url, body, config)
    );
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.handleResponse<T>(
      this.axiosInstance.delete<T>(url, config)
    );
  }

  async getBlob(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const response = await this.axiosInstance.get<Blob>(url, {
      ...config,
      responseType: "blob",
    });
    return response.data;
  }
}

export const apiRequest = new ApiRequest();
export default apiRequest;