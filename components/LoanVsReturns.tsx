"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Loaned vs Profit</CardTitle>
        <CardDescription>{rangeLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="loaned" fill="var(--color-loaned)" radius={4} />
            <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}