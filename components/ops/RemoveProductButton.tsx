"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { removeProductAction } from "@/app/dashboard/ops/actions"

export function RemoveProductButton({ productId, producto }: { productId: string; producto: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRemove() {
    if (!confirm(`¿Eliminar ${producto} del Ops Center?`)) return

    setLoading(true)
    try {
      const result = await removeProductAction(productId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`${producto} eliminado`)
        router.refresh()
      }
    } catch {
      toast.error("Error al eliminar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => { e.stopPropagation(); handleRemove() }}
      disabled={loading}
      className="h-6 w-6 text-muted-foreground hover:text-red-400"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  )
}
