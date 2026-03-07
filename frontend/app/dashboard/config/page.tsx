"use client"

import { useEffect, useState } from "react"
import { appConfigApi, type AppConfig } from "@/lib/api/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Eye, EyeOff, Save, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function ConfigPage() {
  const [gmailAppPassword, setGmailAppPassword] = useState("")
  const [emailSendDelay, setEmailSendDelay] = useState("1000") // Default to 1000ms
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const config = await appConfigApi.getConfig()
      if (config.gmail_app_password) {
        setGmailAppPassword(config.gmail_app_password)
      }
      if (config.email_send_delay) {
        setEmailSendDelay(config.email_send_delay)
      }
    } catch (error) {
      console.error("Failed to fetch config:", error)
      setMessage({ type: "error", text: "Failed to load configuration" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (key: string, value: string, successMessage: string) => {
    setIsSaving(true)
    try {
      await appConfigApi.updateConfig(key, value)
      setMessage({ type: "success", text: successMessage })
    } catch (error) {
      console.error("Failed to save config:", error)
      setMessage({ type: "error", text: "Failed to save configuration" })
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Configuration
        </h1>
        <p className="text-muted-foreground">Set up and manage your application settings</p>
      </div>

      {/* Gmail Configuration */}
      <Card className="border border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle>Global Gmail Configuration</CardTitle>
              <CardDescription>Configure a default Gmail app password for sending emails (Fallback)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-600">How to get your Gmail App Password:</p>
            <ol className="text-sm text-foreground/80 space-y-1 list-decimal list-inside">
              <li>Go to your Google Account settings</li>
              <li>Enable 2-Step Verification if you haven&apos;t already</li>
              <li>Go to App passwords (Security section)</li>
              <li>Select Mail and Windows Computer</li>
              <li>Copy the generated 16-character password</li>
              <li>Paste it below</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Your app password is encrypted and stored securely. Never share it with anyone.
            </p>
          </div>

          {/* App Password Input */}
          <div className="grid gap-2">
            <Label htmlFor="appPassword">Gmail App Password</Label>
            <div className="relative">
              <Input
                id="appPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Ex: abcd efgh ijkl mnop"
                value={gmailAppPassword}
                onChange={(e) => setGmailAppPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={() => handleSave("gmail_app_password", gmailAppPassword, "Gmail settings saved")}
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sending Delay Configuration */}
      <Card className="border border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Email Sending Speed</CardTitle>
              <CardDescription>Control the delay between sending each email to avoid spam detection</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="sendDelay">Delay between emails (milliseconds)</Label>
            <div className="flex gap-4">
              <Input
                id="sendDelay"
                type="number"
                min="100" // Minimum 100ms
                placeholder="1000"
                value={emailSendDelay}
                onChange={(e) => setEmailSendDelay(e.target.value)}
                className="max-w-[200px]"
              />
              <Button
                onClick={() => handleSave("email_send_delay", emailSendDelay, "Speed settings saved")}
                disabled={isSaving || isLoading}
              >
                {isSaving ? "Saving..." : "Update Speed"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Default is 1000ms (1 second). We add a small random variation to this time to make sending look natural.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Message */}
      {message && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-600"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  )
}
