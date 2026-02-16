
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Upload, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface Invoice {
    id: string
    invoice_number: string
    client: string
    date: string
    amount: string
    status: string
}

interface InvoiceListProps {
    data: Invoice[]
}

export function InvoiceList({ data }: InvoiceListProps) {
    const statusColor: Record<string, string> = {
        paid: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        overdue: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        draft: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20",
        sent: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Facturas Recientes</CardTitle>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" /> Subir Factura (PDF)
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-secondary/50 border-border">
                            <TableHead className="w-[100px]">Factura</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-secondary/30 border-border">
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {invoice.invoice_number}
                                </TableCell>
                                <TableCell>{invoice.client}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`border-none ${statusColor[invoice.status] || "bg-secondary text-secondary-foreground"}`}>
                                        {invoice.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold text-foreground">{invoice.amount}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                    No hay facturas registradas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
