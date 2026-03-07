"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, FileText } from "lucide-react"

interface Template {
  id: string
  name: string
  subject: string
  content: string
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("email_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setTemplates(data)
    }
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !formData.name || !formData.subject || !formData.content) return

    if (editingId) {
      await supabase
        .from("email_templates")
        .update({
          name: formData.name,
          subject: formData.subject,
          content: formData.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
    } else {
      await supabase.from("email_templates").insert({
        user_id: user.id,
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
      })
    }

    setFormData({ name: "", subject: "", content: "" })
    setEditingId(null)
    setIsOpen(false)
    fetchTemplates()
  }

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
    })
    setEditingId(template.id)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("email_templates").delete().eq("id", id)
    fetchTemplates()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Email Templates
          </h1>
          <p className="text-muted-foreground">Create and manage email templates for faster sending</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
              setFormData({ name: "", subject: "", content: "" })
              setEditingId(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Template" : "Create New Template"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Job Application"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-border/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Application for {position}"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="border-border/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your email content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  className="border-border/50 font-mono text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                {editingId ? "Update Template" : "Create Template"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Loading templates...</p>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground">No templates yet</p>
              <p className="text-sm text-muted-foreground/60">Create your first email template to get started</p>
            </div>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="border border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">{template.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{template.subject}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 max-h-32 overflow-hidden">
                  <p className="text-sm text-foreground/70 line-clamp-4">{template.content}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
