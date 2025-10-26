import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { subscriptionService } from "@/services/subscriptionService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your subscription...");

  useEffect(() => {
    const verifySubscription = async () => {
      // Get membership ID from URL params (Whop passes this after checkout)
      const membershipId = searchParams.get("membership_id") || 
                          searchParams.get("membership") ||
                          searchParams.get("id");

      if (!membershipId) {
        setStatus("error");
        setMessage("No membership ID found. Please check your email for your membership details.");
        return;
      }

      try {
        // Link the membership to the current user
        const success = await subscriptionService.linkMembership(membershipId);

        if (success) {
          setStatus("success");
          setMessage("Your subscription has been activated successfully!");
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage("We couldn't verify your subscription. Please contact support with your membership ID: " + membershipId);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your subscription. Please try again or contact support.");
      }
    };

    verifySubscription();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === "loading" && (
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          )}
          {status === "error" && (
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          )}
          
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Subscription"}
            {status === "success" && "Welcome to TidyGuru Pro!"}
            {status === "error" && "Verification Issue"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Subscription activated</p>
              <p>✓ Full access granted</p>
              <p>✓ Redirecting to dashboard...</p>
            </div>
          )}
          
          {status === "error" && (
            <div className="space-y-3">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "mailto:support@tidyguru.com"}
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          )}
          
          {status === "loading" && (
            <div className="text-center text-sm text-muted-foreground">
              <p>This should only take a moment...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

