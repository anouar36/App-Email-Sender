"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { senderApi, type Sender, type CreateSenderPayload } from "@/lib/api/senders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSender, setEditingSender] = useState<Sender | null>(null)
  const [formData, setFormData] = useState<CreateSenderPayload>({
    name: "",
    email: "",
    password: "",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSenders()
  }, [])

  const fetchSenders = async () => {
    try {
      setLoading(true)
      const data = await senderApi.getSenders()
      setSenders(data)
    } catch (error) {
      console.error("Failed to fetch senders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch senders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) : value,
    }))
  }

  const handleCheckedChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      secure: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSender) {
        await senderApi.updateSender(editingSender.id, formData)
        toast({
          title: "Success",
          description: "Sender updated successfully",
        })
      } else {
        await senderApi.createSender(formData)
        toast({
          title: "Success",
          description: "Sender created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchSenders()
    } catch (error) {
      console.error("Failed to save sender:", error)
      toast({
        title: "Error",
        description: "Failed to save sender",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (sender: Sender) => {
    setEditingSender(sender)
    setFormData({
      name: sender.name || "",
      email: sender.email,
      password: "", // Don't show password
      host: sender.host,
      port: sender.port,
      secure: sender.secure,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sender?")) return

    try {
      await senderApi.deleteSender(id)
      toast({
        title: "Success",
        description: "Sender deleted successfully",
      })
      fetchSenders()
    } catch (error) {
      console.error("Failed to delete sender:", error)
      toast({
        title: "Error",
        description: "Failed to delete sender",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingSender(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Senders Configuration</h1>
          <p className="text-muted-foreground">Manage your email sending accounts.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Sender
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSender ? "Edit Sender" : "Add New Sender"}</DialogTitle>
              <DialogDescription>
                Configure the SMTP settings for your email sender.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Marketing Email"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sender@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">App Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={editingSender ? "Leave blank to keep current" : "App Password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingSender}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">SMTP Host</Label>
                  <Input
                    id="host"
                    name="host"
                    value={formData.host}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    value={formData.port}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="secure" 
                  checked={formData.secure}
                  onCheckedChange={handleCheckedChange}
                />
                <Label htmlFor="secure">Use Secure Connection (SSL/TLS)</Label>
              </div>
              <DialogFooter>
                <Button type="submit">{editingSender ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading senders...
                  </TableCell>
                </TableRow>
              ) : senders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No senders found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                senders.map((sender) => (
                  <TableRow key={sender.id}>
                    <TableCell className="font-medium">{sender.name || "-"}</TableCell>
                    <TableCell>{sender.email}</TableCell>
                    <TableCell>{sender.host}</TableCell>
                    <TableCell>{sender.port}</TableCell>
                    <TableCell>
                      {sender.isActive ? (
                        <div className="flex items-center text-green-600">
                          <Check className="mr-1 h-3 w-3" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <X className="mr-1 h-3 w-3" /> Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(sender)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(sender.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
