
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MoreHorizontal, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmployeeCard({ employee }: { employee: any }) {
    return (
        <Card className="bg-card text-card-foreground border-border hover:border-primary/50 transition-all group overflow-hidden">
            <Link href={`/dashboard/team/${employee.id}`}>
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">{employee.name}</h3>
                        <p className="text-sm text-primary/80">{employee.role}</p>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" /> {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" /> {employee.phone}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-[10px] bg-secondary/50 text-secondary-foreground border border-border/50">{employee.specialty}</Badge>
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="p-4 border-t border-border bg-secondary/10 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{employee.stats.clients}</span> Clientes
                </div>
                <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{employee.stats.revenue}</span> Ingresos
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
