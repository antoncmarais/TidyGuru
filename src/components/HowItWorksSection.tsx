import howItWorks from "@/assets/how-it-works.png";

export const HowItWorksSection = () => {
  const steps = [
    { number: "01", title: "Upload your CSV", description: "Drag and drop or click to upload" },
    { number: "02", title: "Watch it process", description: "Instant parsing and validation" },
    { number: "03", title: "Get your dashboard", description: "Beautiful insights in seconds" },
  ];

  return (
    <section className="py-20 md:py-28 gradient-hero-light border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to transform your data
          </p>
        </div>

        <div className="mb-12 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <img 
            src={howItWorks} 
            alt="How it works visualization" 
            className="w-full h-auto rounded-2xl shadow-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="text-6xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
