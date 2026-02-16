
"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts"

interface RevenueChartProps {
    data: { name: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="w-full h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#C9A24D" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
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
                        tickFormatter={(value: number) => `${(value / 1000).toFixed(1)}k€`}
                        fontWeight="bold"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 17, 21, 0.95)',
                            border: '1px solid rgba(201, 162, 77, 0.3)',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#C9A24D', fontWeight: 'bold' }}
                        labelStyle={{ color: '#888888', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                        cursor={{ stroke: 'rgba(201, 162, 77, 0.2)', strokeWidth: 2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#C9A24D"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        animationDuration={2000}
                        activeDot={{ r: 6, fill: '#C9A24D', stroke: '#0F1115', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
