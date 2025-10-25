import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoIcon from "@/assets/logo-icon.svg";
import { HeroSection } from "@/components/HeroSection";
import { ImpactSection } from "@/components/ImpactSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

    return (
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
              <img src={logoIcon} alt="TidyGuru Logo" className="h-10 w-10" />
              <span className="text-xl font-bold text-foreground">TidyGuru</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/signup")}
            >
              Sign Up Free
            </Button>
          </div>
          </div>
        </header>

            {/* Hero Section */}
            <HeroSection />

            {/* Impact Section */}
            <ImpactSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <footer className="py-10 text-center border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2">
                Works with Shopify, Gumroad, Whop, Etsy, WooCommerce, and any platform that exports CSV
              </p>
              <p className="text-xs text-muted-foreground/70">
                Free forever • No credit card required • Privacy-first
              </p>
            </footer>
    </div>
  );
};

export default Index;
