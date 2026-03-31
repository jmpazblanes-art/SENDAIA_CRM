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
        <div className="w-full h-[300px] md:h-[350px] pt-4">
            {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#C9A24D" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#ffffff08"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            fontWeight="bold"
                        />
                        <YAxis
                            stroke="#888888"
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
                                backgroundColor: "rgba(15, 17, 21, 0.95)",
                                border: "1px solid rgba(201, 162, 77, 0.3)",
                                borderRadius: "12px",
                                color: "#FFFFFF",
                                backdropFilter: "blur(10px)",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                                padding: "12px",
                            }}
                            itemStyle={{ color: "#C9A24D", fontWeight: "bold" }}
                            labelStyle={{
                                color: "#888888",
                                marginBottom: "4px",
                                fontSize: "10px",
                                textTransform: "uppercase",
                                fontWeight: "bold",
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
                                stroke: "rgba(201, 162, 77, 0.2)",
                                strokeWidth: 2,
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#C9A24D"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                            activeDot={{
                                r: 6,
                                fill: "#C9A24D",
                                stroke: "#0F1115",
                                strokeWidth: 2,
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
