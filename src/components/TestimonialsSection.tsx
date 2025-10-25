import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "I uploaded my Etsy sales CSV and instantly knew which products to restock. Took literally 10 seconds.",
      author: "Sarah M.",
      role: "Etsy Shop Owner",
      initial: "S",
    },
    {
      quote: "Finally, a tool that doesn't make me feel like I need a data science degree. Just works.",
      author: "James K.",
      role: "Indie SaaS Founder",
      initial: "J",
    },
    {
      quote: "I've spent hours fighting with Excel. This gave me clarity in under a minute. Game changer.",
      author: "Alex R.",
      role: "Digital Creator",
      initial: "A",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by creators who hate complexity
          </h2>
          <p className="text-lg text-muted-foreground">
            Real people. Real results. Zero learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card
              key={testimonial.author}
              className="p-8 hover:shadow-xl transition-all duration-300 animate-scale-in border-border/50"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                  {testimonial.initial}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
