import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, RefreshCw, ShoppingCart } from "lucide-react";

export const LandingPreview = () => {
  const metrics = [
    {
      title: "Total Sales",
      emoji: "💰",
      description: "All-time gross revenue",
    },
    {
      title: "Refunds",
      emoji: "🔄",
      description: "Processed refunds deducted from totals",
    },
    {
      title: "Net Revenue",
      emoji: "📈",
      description: "After refunds and fees",
    },
    {
      title: "Orders",
      emoji: "🛒",
      description: "Count of completed orders",
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      {/* What You'll See Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            What you'll see instantly
          </h2>
          <p className="text-sm text-muted-foreground">
            Charts will appear here after you upload your first CSV
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <Card
              key={metric.title}
              className="p-5 hover:shadow-lg transition-all duration-300 animate-scale-in bg-card hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 group cursor-default border-border/50"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {metric.emoji}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {metric.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 animate-scale-in bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Revenue Trend Chart</h3>
              <p className="text-xs text-muted-foreground">Line chart over time</p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">Chart will appear after upload</p>
          </div>
        </Card>

        <Card className="p-6 animate-scale-in bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50" style={{ animationDelay: "0.8s" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Top Products</h3>
              <p className="text-xs text-muted-foreground">Bar chart by revenue</p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">Chart will appear after upload</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
