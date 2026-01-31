import { createRootRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { ProfileDropdown } from "../components/ProfileDropdown";
import { Suspense } from "react";
import { PageLoader } from "../components/PageLoader";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  userId: string;
  email: string;
}

function isAuthenticated() {
  return !!Cookies.get("token");
}

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: async ({ location }) => {
    if (
      location.pathname.startsWith("/auth/login") ||
      location.pathname.startsWith("/auth/register")
    ) {
      return;
    }
    if (!isAuthenticated()) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.pathname },
      });
    }
  },
});

function RootComponent() {
  const location = useLocation();
  const hideSidebar =
    location.pathname.startsWith("/auth/login") ||
    location.pathname.startsWith("/auth/register");

  // Get user email from token
  let userEmail: string | undefined;
  const token = Cookies.get("token");
  if (token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      userEmail = decoded.email;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-blue-50 via-emerald-50 to-teal-50 text-slate-900">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Profile */}
        {!hideSidebar && (
          <div className="flex justify-end items-center px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
            <ProfileDropdown userEmail={userEmail} />
          </div>
        )}

        <main className="flex-1 px-8 py-8 w-full">
          <Suspense
            fallback={
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/90">
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
    </div>
  );
}