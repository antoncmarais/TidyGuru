import { Card } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, ShoppingCart } from "lucide-react";

export const LandingPreview = () => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h3 className="text-lg font-semibold text-center text-foreground mb-6">
        What you'll see instantly
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-muted">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Sales</p>
              <p className="text-sm font-semibold text-muted-foreground/50">$--</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-muted">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Refunds</p>
              <p className="text-sm font-semibold text-muted-foreground/50">$--</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-muted">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Revenue</p>
              <p className="text-sm font-semibold text-muted-foreground/50">$--</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-muted">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-sm font-semibold text-muted-foreground/50">--</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-muted">
          <div className="h-40 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <TrendingUp className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Revenue Trend Chart</p>
              <p className="text-xs text-muted-foreground/70">Line chart over time</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-muted">
          <div className="h-40 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <ShoppingCart className="h-8 w-8 text-accent/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Top Products</p>
              <p className="text-xs text-muted-foreground/70">Bar chart by revenue</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
