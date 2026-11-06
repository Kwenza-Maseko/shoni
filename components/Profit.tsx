"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

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

export const description = "Total profit realized, broken down by month"

interface ProfitProps {
  totalProfit: number;
  monthlyData: MonthlyLoanStat[]; // uses only the `profit` field of each month
}

const formatCurrency = (amount: number) => {
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chartConfig = {
  profit: {
    label: "Profit",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function Profit({ totalProfit, monthlyData }: ProfitProps) {
  return (
    <div className="w-full">
      <Card className="border border-gray-800 bg-gray-700 p-4 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Total Profit Made</CardTitle>
          <CardDescription className="text-green-500">
            {formatCurrency(totalProfit)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={monthlyData}
              layout="vertical"
              margin={{ left: -20, right: 8 }}
              barCategoryGap={14}
            >
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              <XAxis type="number" dataKey="profit" hide />
              <YAxis
                dataKey="month"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "#ffffff", fontSize: 12 }}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(255,255,255,0.05)", radius: 6 }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                }
              />
              <Bar
                dataKey="profit"
                fill="url(#profitGradient)"
                barSize={14}
                radius={[0, 4, 4, 0]}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
                style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.55))" }}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}