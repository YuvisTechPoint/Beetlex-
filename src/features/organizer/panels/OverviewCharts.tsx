import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type OverviewChartsProps = {
  registrationChartData: { hour: string; count: number; timestamp: number }[]
  submissionsByTrack: { name: string; submissions: number; teams: number }[]
  scoreDistribution: { range: string; count: number; min: number; max: number }[]
}

export default function OverviewCharts({
  registrationChartData,
  submissionsByTrack,
  scoreDistribution,
}: OverviewChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Registrations (24h)</CardTitle>
          <CardDescription>Hourly registration volume</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Submissions by Track</CardTitle>
          <CardDescription>Final submissions per track</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={submissionsByTrack}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Score Distribution</CardTitle>
          <CardDescription>Team scores (1–40 scale)</CardDescription>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="hsl(var(--chart-2, var(--primary)))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
