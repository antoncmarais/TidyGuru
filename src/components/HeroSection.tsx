import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroMain from "@/assets/u2945372488_sleek_3D_hero_visual_showing_transformation_from__f69b79c1-2301-4189-ac40-32eabb918506_3.png";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-20 md:py-32">
      {/* Ambient glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Transform messy data
            <br />
            into clean insights
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            Upload your sales CSV and watch it turn into instant analytics — no setup, no spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
            >
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6"
            >
              Log In
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={heroMain} 
              alt="Data transformation visualization" 
              className="w-full h-auto"
            />
            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
