"use client"

import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { MonthlyLoanStat } from "@/lib/loan-stat"

export const description = "Money loaned out vs profit realized, per month"

interface LoanVsReturnProps {
  data: MonthlyLoanStat[];
}

const chartConfig = {
  loaned: {
    label: "Loaned",
    color: "var(--chart-1)",
  },
  profit: {
    label: "Profit",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function LoanVsReturn({ data }: LoanVsReturnProps) {
  const rangeLabel =
    data.length > 0 ? `${data[0].month} - ${data[data.length - 1].month}` : "";

  return (
    <Card className="border border-gray-800 bg-gray-700 p-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Loaned vs Profit</CardTitle>
        <CardDescription className="text-amber-600">{rangeLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            barCategoryGap={18}
            barGap={0}
          >
            <defs>
              {/* Loaned: deep amber */}
              <linearGradient id="loanedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
              {/* Profit: bright amber */}
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#4b5563" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "#ffffff", fontSize: 12 }}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              cursor={<Rectangle fill="rgba(251,191,36,0.08)" stroke="none" radius={6} />}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  className="border-gray-700 bg-gray-800 text-white"
                />
              }
            />
            <Bar
              dataKey="loaned"
              fill="url(#loanedGradient)"
              barSize={14}
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
              style={{ filter: "drop-shadow(0 0 5px rgba(217,119,6,0.45))" }}
            />
            <Bar
              dataKey="profit"
              fill="url(#profitGradient)"
              barSize={14}
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
              animationBegin={150}
              style={{ filter: "drop-shadow(0 0 5px rgba(251,191,36,0.5))" }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}