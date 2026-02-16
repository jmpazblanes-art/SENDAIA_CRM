
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
    user: string
    action: string
    target: string
    time: string
    type: string
}

interface RecentActivityProps {
    activities?: Activity[]
}

const defaultActivities = [
    {
        user: "José María Paz",
        action: "creó cliente",
        target: "Clínica Dental Sur",
        time: "10:00",
        type: "new_client"
    },
    {
        user: "Ana García",
        action: "Cita programada",
        target: "Asesoría Pérez",
        time: "12:30",
        type: "appointment"
    }
]

export function RecentActivity({ activities = defaultActivities }: RecentActivityProps) {
    return (
        <Card className="bg-card border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center justify-between">
                    Próximas Actividades
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">HOY</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors border border-transparent hover:border-border/50">
                                <div className="flex-col text-center min-w-[40px]">
                                    <span className="block text-xs font-bold text-primary font-mono">{activity.time}</span>
                                </div>
                                <div className="relative mt-1">
                                    <span className="h-2 w-2 rounded-full bg-primary absolute top-1.5 left-0 ring-4 ring-primary/10"></span>
                                </div>
                                <div className="space-y-1 pl-2">
                                    <p className="text-sm font-bold text-foreground leading-none">
                                        {activity.target}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {activity.action} • <span className="text-primary/70">{activity.user}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-muted-foreground italic text-xs">
                            No hay actividades programadas.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
