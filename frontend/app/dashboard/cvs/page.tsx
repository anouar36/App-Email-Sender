"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Download, Trash2 } from "lucide-react"

interface CVDocument {
  id: string
  name: string
  file_path: string
  file_size: number
  created_at: string
}

export default function CVsPage() {
  const [cvs, setCvs] = useState<CVDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCVs()
  }, [])

  const fetchCVs = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("cv_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setCvs(data)
    }
    setIsLoading(false)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `cvs/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)

    if (!uploadError) {
      const { error: dbError } = await supabase.from("cv_documents").insert({
        user_id: user.id,
        name: file.name,
        file_path: filePath,
        file_size: file.size,
      })

      if (!dbError) {
        setFileName("")
        setIsOpen(false)
        fetchCVs()
      }
    }

    setIsUploading(false)
  }

  const handleDelete = async (id: string, filePath: string) => {
    const supabase = createClient()
    await supabase.storage.from("documents").remove([filePath])
    await supabase.from("cv_documents").delete().eq("id", id)
    fetchCVs()
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from("documents").download(filePath)

    if (data) {
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CV Management
          </h1>
          <p className="text-muted-foreground">Upload and manage your CV documents</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" />
              Upload CV
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50">
            <DialogHeader>
              <DialogTitle>Upload New CV</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="cv-file">Select CV File (PDF, DOC, DOCX)</Label>
                <Input
                  id="cv-file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                  disabled={isUploading}
                  className="border-border/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX. Maximum file size: 10MB
              </p>
              {isUploading && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* CV List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Loading CVs...</p>
            </div>
          </div>
        ) : cvs.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
              <p className="text-muted-foreground">No CVs uploaded yet</p>
              <p className="text-sm text-muted-foreground/60">Start by uploading your first CV document</p>
            </div>
          </div>
        ) : (
          cvs.map((cv) => (
            <Card key={cv.id} className="border border-border/50 hover:border-primary/50 transition-colors group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate" title={cv.name}>
                        {cv.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(cv.file_size)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(cv.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
                      onClick={() => handleDownload(cv.file_path, cv.name)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                      onClick={() => handleDelete(cv.id, cv.file_path)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
