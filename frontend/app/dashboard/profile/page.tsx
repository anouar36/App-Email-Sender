"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Camera, Save, Moon, Sun } from "lucide-react"

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  avatar_url: string | null
  theme_mode: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setEmail(user.email || "")

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (data) {
      setProfile(data)
      setIsDarkMode(data.theme_mode === "dark")
    }

    setIsLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        theme_mode: isDarkMode ? "dark" : "light",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (!error) {
      setMessage({ type: "success", text: "Profile updated successfully!" })
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    } else {
      setMessage({ type: "error", text: "Failed to update profile" })
    }

    setIsSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${profile.id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", profile.id)

      if (!updateError) {
        setProfile({ ...profile, avatar_url: urlData.publicUrl })
        setMessage({ type: "success", text: "Avatar updated successfully!" })
      }
    }

    setTimeout(() => setMessage(null), 3000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleAvatarClick}
              className="relative group w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" hidden />
            <div>
              <p className="font-semibold">
                {profile?.first_name || "User"} {profile?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
                onClick={handleAvatarClick}
              >
                Change Avatar
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile?.first_name || ""}
                onChange={(e) => setProfile({ ...profile!, first_name: e.target.value })}
                className="border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile?.last_name || ""}
                onChange={(e) => setProfile({ ...profile!, last_name: e.target.value })}
                className="border-border/50"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile?.username || ""}
                onChange={(e) => setProfile({ ...profile!, username: e.target.value })}
                className="border-border/50"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="border-border/50 bg-muted/30" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-600 border border-green-500/30"
                  : "bg-red-500/10 text-red-600 border border-red-500/30"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize your dashboard appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="font-medium text-sm">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            variant="outline"
            className="w-full border-primary/50 bg-transparent"
          >
            Apply Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
