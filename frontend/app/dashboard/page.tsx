"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { emailApi, type Analytics } from "@/lib/api/emails"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { BarChart3, Mail, TrendingUp, Users } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const token = authApi.getToken()
      
      if (!token) {
        router.push("/auth/login")
        return
      }

      try {
        const data = await emailApi.getAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        if (error instanceof Error && error.message === "Not authenticated") {
          router.push("/auth/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const chartData = [
    { day: "Mon", sent: 12, opened: 8 },
    { day: "Tue", sent: 19, opened: 12 },
    { day: "Wed", sent: 25, opened: 18 },
    { day: "Thu", sent: 22, opened: 15 },
    { day: "Fri", sent: 31, opened: 24 },
    { day: "Sat", sent: 18, opened: 14 },
    { day: "Sun", sent: 15, opened: 11 },
  ]

  const statCards = [
    { title: "Total Campaigns", value: analytics?.totalCampaigns || 0, icon: Mail, color: "from-primary" },
    { title: "Emails Sent", value: analytics?.totalSent || 0, icon: TrendingUp, color: "from-accent" },
    { title: "Emails Opened", value: analytics?.totalOpened || 0, icon: Users, color: "from-secondary" },
    { title: "Failed", value: analytics?.totalFailed || 0, icon: BarChart3, color: "from-purple-500" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your email sending statistics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} to-transparent flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "..." : stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">Based on your campaigns</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sent vs Opened Chart */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="sent" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="opened" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Open Rate Chart */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle>Open Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.1)" }}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-2)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-12">New Campaign</Button>
            <Button variant="outline" className="border-primary/50 h-12 bg-transparent">
              View Templates
            </Button>
            <Button variant="outline" className="border-primary/50 h-12 bg-transparent">
              Manage CVs
            </Button>
            <Button variant="outline" className="border-primary/50 h-12 bg-transparent">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
