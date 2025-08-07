import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const tier = searchParams.get('tier') || 'ultra';

  useEffect(() => {
    // Refresh user data to get updated subscription status
    window.location.reload();
  }, []);

  const tierNames = {
    ultra: 'Ultra Access',
    pro: 'Pro'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-300">
            Zahlung erfolgreich!
          </CardTitle>
          <CardDescription>
            Ihr {tierNames[tier as keyof typeof tierNames]} Abonnement wurde aktiviert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vielen Dank für Ihr Vertrauen in wensday.ch! Ihr Abonnement ist sofort aktiv und Sie können alle Premium-Funktionen nutzen.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-[hsl(129.4118,100%,27.0588%)] hover:bg-[hsl(129.4118,100%,22%)] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat starten
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Zur Startseite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}