import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Revenue Trend</h3>
      <div
        role="img"
        aria-label={`Line chart showing revenue trend over ${data.length} time periods. Total revenue: $${totalRevenue.toFixed(2)}. Average revenue: $${avgRevenue.toFixed(2)}.`}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              aria-label="Revenue data points"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
