import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Lock, ExternalLink } from "lucide-react";
import { subscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const SubscriptionGate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [membershipId, setMembershipId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubscribe = () => {
    const checkoutUrl = subscriptionService.getCheckoutUrl(user?.email);
    window.open(checkoutUrl, '_blank');
  };

  const handleVerify = async () => {
    if (!membershipId.trim()) {
      toast({
        title: "Missing membership ID",
        description: "Please enter your Whop membership ID",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const success = await subscriptionService.syncFromWhop(membershipId.trim());

      if (success) {
        toast({
          title: "Success!",
          description: "Your subscription has been verified. Refreshing...",
        });
        
        // Refresh the page to update subscription status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Verification failed",
          description: "Could not verify your subscription. Please check your membership ID and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while verifying your subscription.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Subscribe to TidyGuru Pro</CardTitle>
          <CardDescription className="text-base">
            Get unlimited access to powerful CSV analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Unlimited CSV Uploads</p>
                <p className="text-sm text-muted-foreground">Upload and analyze as many files as you need</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Beautiful Dashboards</p>
                <p className="text-sm text-muted-foreground">Auto-generated charts and insights in seconds</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Premium PDF Exports</p>
                <p className="text-sm text-muted-foreground">Download professional reports with charts</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Data Storage</p>
                <p className="text-sm text-muted-foreground">All your uploads saved and accessible anytime</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-6 border-t">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">
                $5<span className="text-2xl font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">Cancel anytime. No hidden fees.</p>
            </div>
            <Button onClick={handleSubscribe} className="w-full" size="lg">
              Subscribe Now <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Already Subscribed?</CardTitle>
          <CardDescription>
            Enter your Whop membership ID to verify your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="membership-id">Membership ID</Label>
            <Input
              id="membership-id"
              placeholder="mem_xxxxxxxxxxxxx"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              disabled={isVerifying}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Whop account or confirmation email
            </p>
          </div>

          <Button 
            onClick={handleVerify} 
            variant="outline" 
            className="w-full"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Subscription"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? <a href="mailto:support@tidyguru.com" className="text-primary hover:underline">Contact support</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



