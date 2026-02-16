
"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
        <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Calendario</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                />
            </CardContent>
        </Card>
    )
}
