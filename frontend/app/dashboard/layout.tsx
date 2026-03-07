"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { authApi, type User } from "@/lib/api/auth"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Activity, Settings, User as UserIcon, LogOut, Menu, X, Mail } from "lucide-react"

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/dashboard/emails", label: "Email Management", icon: "📧" },
  { href: "/dashboard/senders", label: "Senders Config", icon: Mail },
  { href: "/dashboard/cvs", label: "CV Management", icon: "📄" },
  { href: "/dashboard/templates", label: "Templates", icon: "🎨" },
  { href: "/dashboard/config", label: "Configuration", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = authApi.getToken()
      
      if (!token) {
        router.push("/auth/login")
        return
      }

      try {
        const userData = await authApi.getCurrentUser(token)
        setUser(userData)
      } catch (error) {
        console.error("Auth check failed:", error)
        authApi.logout()
        router.push("/auth/login")
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    authApi.logout()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-sidebar-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sidebar-foreground">Email Hub</p>
                <p className="text-xs text-sidebar-foreground/60">Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = typeof item.icon === "string" ? null : item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                  }`}
                >
                  {/* @ts-ignore */}
                  {Icon ? <Icon className="w-5 h-5" /> : <span className="text-lg">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="px-4 py-2 bg-sidebar-accent/10 rounded-lg">
              <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/20 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 left-4 z-50 md:hidden bg-primary text-primary-foreground p-2 rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>

      {/* Mobile overlay */}
      {isOpen && <div className="absolute inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
