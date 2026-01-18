import { User, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import Cookies from "js-cookie"

interface ProfileDropdownProps {
    userEmail?: string
}

export function ProfileDropdown({ userEmail }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const handleLogout = () => {
        // Remove token cookie
        Cookies.remove("token")

        // Redirect to login
        navigate({ to: "/auth/login" })
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Profile menu"
            >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-700" />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    {userEmail && (
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-xs text-muted-foreground">Signed in as</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                        </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-1">

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
