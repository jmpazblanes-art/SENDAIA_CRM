"use client"

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"

interface RevenueChartProps {
    data: { name: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const hasData = data.some((d) => d.total > 0)

    return (
        <div
            className="w-full h-[300px] md:h-[350px] pt-4"
            style={{
                animation: "chart-fade-in 0.8s ease-out both",
            }}
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            {/* Enhanced multi-stop gold gradient */}
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.45} />
                                <stop offset="25%" stopColor="#C9A24D" stopOpacity={0.3} />
                                <stop offset="60%" stopColor="#C9A24D" stopOpacity={0.1} />
                                <stop offset="100%" stopColor="#C9A24D" stopOpacity={0} />
                            </linearGradient>
                            {/* Glow filter for the line */}
                            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feFlood floodColor="#C9A24D" floodOpacity="0.3" result="color" />
                                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                                <feMerge>
                                    <feMergeNode in="shadow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.03)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            stroke="#555555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            fontWeight="bold"
                        />
                        <YAxis
                            stroke="#555555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) =>
                                value >= 1000
                                    ? `${(value / 1000).toFixed(1)}k\u20AC`
                                    : `${value}\u20AC`
                            }
                            fontWeight="bold"
                            width={55}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(10, 12, 16, 0.96)",
                                border: "1px solid rgba(212, 175, 55, 0.25)",
                                borderRadius: "12px",
                                color: "#FFFFFF",
                                backdropFilter: "blur(16px)",
                                boxShadow:
                                    "0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(201,162,77,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                                padding: "14px 16px",
                            }}
                            itemStyle={{
                                color: "#D4AF37",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                            labelStyle={{
                                color: "#888888",
                                marginBottom: "6px",
                                fontSize: "10px",
                                textTransform: "uppercase" as const,
                                fontWeight: "bold",
                                letterSpacing: "0.1em",
                            }}
                            formatter={(value: number | undefined) => {
                                const v = value ?? 0
                                return [
                                    new Intl.NumberFormat("es-ES", {
                                        style: "currency",
                                        currency: "EUR",
                                        minimumFractionDigits: 0,
                                    }).format(v),
                                    "Ingresos",
                                ]
                            }}
                            cursor={{
                                stroke: "rgba(212, 175, 55, 0.15)",
                                strokeWidth: 1,
                                strokeDasharray: "4 4",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#D4AF37"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1800}
                            animationEasing="ease-out"
                            filter="url(#goldGlow)"
                            activeDot={{
                                r: 6,
                                fill: "#D4AF37",
                                stroke: "#0A0C10",
                                strokeWidth: 3,
                                style: {
                                    filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))",
                                },
                            }}
                            dot={{
                                r: 2,
                                fill: "#D4AF37",
                                stroke: "none",
                                opacity: 0.5,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                    No hay datos de facturación en este periodo.
                </div>
            )}
        </div>
    )
}
