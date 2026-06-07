import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StudyEffect {
  studyId: string
  label: string
  effectSize: number
  ciLower: number
  ciUpper: number
}

interface Props {
  data: StudyEffect[]
  pooledEffect?: number
  title?: string
}

export function ForestPlot({ data, pooledEffect, title = 'Forest Plot' }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Add effect sizes to included studies to generate a forest plot.
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    name: d.label.slice(0, 30),
    effect: d.effectSize,
    ciLower: d.ciLower,
    ciUpper: d.ciUpper,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={['auto', 'auto']} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
            <Tooltip />
            {pooledEffect !== undefined && (
              <ReferenceLine x={pooledEffect} stroke="#1e40af" strokeDasharray="5 5" label="Pooled" />
            )}
            <ReferenceLine x={0} stroke="#94a3b8" />
            <Bar dataKey="effect" radius={2}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={chartData[i].effect < 0 ? '#dc2626' : '#16a34a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
