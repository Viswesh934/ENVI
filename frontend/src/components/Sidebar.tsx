import { Link, useRouterState } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Today", to: "/" },
  { label: "Air Quality", to: "/aqi" },
  { label: "Green Cover", to: "/tree" },
  { label: "Activity", to: "/activity" },
]

export function Sidebar() {
  const { location } = useRouterState()

  return (
    <aside className="w-64 min-h-screen bg-background border-r">
      <div className="flex h-full flex-col px-6 py-8">
        {/* Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight">
              🌴 ENVI
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Environment, simplified
          </p>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="mt-6 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive &&
                    "bg-emerald-50 text-emerald-700"
                )}
              >
                {/* Active rail */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-emerald-500" />
                )}

                <span className="ml-2">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-8 text-xs text-muted-foreground">
          MVP • © {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  )
}
