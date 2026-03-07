"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Plus, FileDown, Trash2, Eye, Upload, Image as ImageIcon } from "lucide-react"
import Papa from "papaparse"
import axios from "axios"
import { authApi } from "@/lib/api/auth"
import type { AppConfig } from "@/lib/api/config"

interface EmailCampaign {
  id: string
  name: string
  recipient_email: string
  recipient_company: string
  status: string
  sent_at: string | null
  opened_at: string | null
  created_at: string
}

export default function EmailsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  const [formData, setFormData] = useState({
    email: "",
    company: "",
    template_id: "",
  })

  // New state for image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
  }, [])

  const fetchCampaigns = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setCampaigns(data)
    }
    setIsLoading(false)
  }

  const fetchTemplates = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase.from("email_templates").select("*").eq("user_id", user.id)

    if (data) {
      setTemplates(data)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImage(file)
    setIsUploading(true)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const token = authApi.getToken()
      const response = await axios.post("http://localhost:5000/api/emails/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setImageUrl(response.data.url)
      alert(`Image uploaded! URL: ${response.data.url}`)
    } catch (error) {
      console.error("Upload failed", error)
      alert("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !formData.email) return

    const { data, error } = await supabase.from("email_campaigns").insert({
      user_id: user.id,
      name: `Email to ${formData.company || formData.email}`,
      recipient_email: formData.email,
      recipient_company: formData.company,
      template_id: formData.template_id || null,
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    if (!error) {
      setFormData({ email: "", company: "", template_id: "" })
      setIsOpen(false)
      fetchCampaigns()
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("email_campaigns").delete().eq("id", id)
    fetchCampaigns()
  }

  const handleExportToExcel = () => {
    const exportData = campaigns.map((campaign) => ({
      "Campaign Name": campaign.name,
      "Recipient Email": campaign.recipient_email,
      Company: campaign.recipient_company || "N/A",
      Status: campaign.status,
      "Sent Date": campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : "Not sent",
      "Opened Date": campaign.opened_at ? new Date(campaign.opened_at).toLocaleString() : "Not opened",
    }))

    const csv = Papa.unparse(exportData)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `email_campaigns_${new Date().getTime()}.csv`
    a.click()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Email Management
          </h1>
          <p className="text-muted-foreground">Send and track your email campaigns</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportToExcel} variant="outline" className="border-primary/50 bg-transparent gap-2">
            <FileDown className="w-4 h-4" />
            Export to Excel
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" />
                New Email
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/50">
              <DialogHeader>
                <DialogTitle>Send New Email</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="image-upload">Attach Image (Embeds in email)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border-border/50 max-w-[300px]"
                    />
                    {isUploading && <span className="text-sm self-center">Uploading...</span>}
                  </div>
                  {imageUrl && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Image uploaded ready to send
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Recipient Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="border-border/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="Company Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="border-border/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template">Select Template (Optional)</Label>
                  <select
                    id="template"
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    className="border border-border/50 rounded-lg px-3 py-2 bg-background text-foreground"
                  >
                    <option value="">No template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Send Email
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Campaigns List */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-muted-foreground text-sm">Loading campaigns...</p>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Mail className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground">No campaigns yet</p>
                <p className="text-sm text-muted-foreground/60">Start by creating your first email campaign</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Sent</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{campaign.name}</td>
                      <td className="py-3 px-4 text-sm">{campaign.recipient_email}</td>
                      <td className="py-3 px-4 text-sm">{campaign.recipient_company || "-"}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            campaign.status === "sent" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-700"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                            onClick={() => handleDelete(campaign.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
