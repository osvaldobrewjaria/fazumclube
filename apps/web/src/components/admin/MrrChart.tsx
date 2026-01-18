'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface MrrHistoryItem {
  month: string
  year: number
  mrr: number
  subscribers: number
  newUsers: number
}

interface MrrChartProps {
  data: MrrHistoryItem[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium mb-2">{label}</p>
        <p className="text-brew-gold text-sm">
          MRR: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-gray-400 text-sm">
          Assinantes: {payload[0].payload.subscribers}
        </p>
        <p className="text-green-400 text-sm">
          Novos usuários: +{payload[0].payload.newUsers}
        </p>
      </div>
    )
  }
  return null
}

export default function MrrChart({ data }: MrrChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500">
        Sem dados históricos
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="mrr"
            stroke="#d4af37"
            strokeWidth={2}
            fill="url(#mrrGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
