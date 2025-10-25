import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopProductsChartProps {
  data: {
    product: string;
    fullProduct?: string;
    displayProduct?: string;
    revenue: number;
  }[];
}

export const TopProductsChart = ({ data }: TopProductsChartProps) => {
  const productList = data
    .map((item) => `${item.fullProduct || item.product}: $${item.revenue.toFixed(2)}`)
    .join(", ");

  // Custom tooltip to show full product name
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="bg-card border border-border rounded-lg p-3 shadow-lg"
          style={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <p className="text-sm font-medium text-foreground mb-1">
            {data.fullProduct || data.product}
          </p>
          <p className="text-sm text-primary font-semibold">
            Revenue: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Top 5 Products by Revenue
      </h3>
      <div
        role="img"
        aria-label={`Bar chart showing top ${data.length} products by revenue. ${productList}`}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="displayProduct"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              aria-label="Product revenue bars"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
