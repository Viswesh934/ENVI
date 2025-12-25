
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { Suspense } from "react";
import { PageLoader } from "../components/PageLoader";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen flex bg-linear-to-br from-blue-50 via-emerald-50 to-teal-50 text-slate-900">
      <Sidebar />
      <main className="flex-1 mx-auto max-w-4xl px-6 py-8">
        <Suspense 
          fallback={
            <div className="fixed inset-0 left-64 flex items-center justify-center z-50 bg-white/90">
              <div className="text-center space-y-6">
                <PageLoader 
                  variant="gradient"
                  size="lg"
                  text="Loading your environment dashboard"
                  fullScreen={false}
                />
                <div className="space-y-2">
                  <div className="h-2 w-64 mx-auto bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-emerald-500 rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Gathering environmental insights...
                  </p>
                </div>
              </div>
            </div>
          }
        > 
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}