import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import "./index.css"
import { router } from "./router"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster 
        position="bottom-center"
        richColors
        expand={false}
        className="max-w-md mx-auto"
        duration={3000}
        toastOptions={{
          style: { width: "400px", maxWidth: "100%" },
          duration: 4000
        }}
        closeButton={false}
      />
    </QueryClientProvider>
  </StrictMode>
)