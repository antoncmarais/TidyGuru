import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 gradient-hero relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-warm/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to see your data in a whole new way?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Create a free account and start exploring your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
              onClick={() => navigate("/signup")}
            >
              Sign Up to Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white hover:text-primary text-lg px-8 py-6 bg-transparent"
              onClick={() => navigate("/login")}
            >
              Already have an account? Log In
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
