import { createRootRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white shadow-sm">
        <nav className="mx-auto flex gap-6 px-6 py-4 max-w-4xl text-lg">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link to="/aqi" className="hover:text-blue-600">
            AQI
          </Link>
          <Link to="/about" className="hover:text-blue-600">
            About
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}