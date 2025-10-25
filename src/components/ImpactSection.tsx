import { Card } from "@/components/ui/card";
import { Upload, Zap, Sparkles } from "lucide-react";

export const ImpactSection = () => {
  const features = [
    {
      icon: Upload,
      title: "Upload from anywhere",
      description: "Shopify, Gumroad, Whop, Etsy—if it exports CSV, we handle it. Drag, drop, done.",
      gradient: "from-primary/10 to-accent/10",
    },
    {
      icon: Zap,
      title: "Instant answers to your revenue questions",
      description: "Which products are winning? Where's your money going? Know in seconds, not hours.",
      gradient: "from-accent/10 to-primary-light/10",
    },
    {
      icon: Sparkles,
      title: "Zero learning curve",
      description: "If you can drag and drop a file, you're ready. No tutorials, no training, no complexity.",
      gradient: "from-accent-warm/10 to-primary/10",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for creators, indie founders, and small teams who want clarity without complexity. Done with overwhelming analytics? So are we.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className="p-8 hover:shadow-xl transition-all duration-300 animate-scale-in group cursor-default border-border/50 bg-gradient-to-br hover:from-primary/5 hover:to-accent/5"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
