"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { addProductAction } from "@/app/dashboard/ops/actions"

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const result = await addProductAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Producto añadido al Ops Center")
        setOpen(false)
        router.refresh()
      }
    } catch {
      toast.error("Error al añadir producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#C9A24D] hover:bg-[#C9A24D]/80 text-black font-bold">
          <Plus className="h-4 w-4 mr-1" />
          Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Producto</DialogTitle>
          <DialogDescription>
            Añade un nuevo producto o app para monitorizar en el Ops Center.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="producto">Nombre del producto</Label>
            <Input
              id="producto"
              name="producto"
              placeholder="MedicApp"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo">Repositorio GitHub</Label>
            <Input
              id="repo"
              name="repo"
              placeholder="jmpazblanes-art/medicapp"
              required
            />
            <p className="text-xs text-muted-foreground">
              Formato: owner/repo
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="url_app">URL de la app (opcional)</Label>
            <Input
              id="url_app"
              name="url_app"
              placeholder="https://medicapp.vercel.app"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#C9A24D] hover:bg-[#C9A24D]/80 text-black font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Añadir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
