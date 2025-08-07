import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Shield, Zap } from "lucide-react";
import { SiPostman } from "react-icons/si";

const POSTFINANCE_PLANS = {
  ultra: {
    name: 'Ultra Access',
    price: 'CHF 15.00',
    period: 'pro Monat',
    description: 'Erweiterte AI-Funktionen für professionelle Nutzer',
    features: [
      '500 AI-Nachrichten pro Tag',
      'Gemini 2.5 Flash Modell',
      'Schweizer Datenverarbeitung',
      'E-Mail Support',
      'Gespräche speichern',
    ],
    color: 'from-blue-500 to-cyan-500',
    popular: false,
  },
  pro: {
    name: 'Pro',
    price: 'CHF 35.00',
    period: 'pro Monat',
    description: 'Unbegrenzte AI-Power für Unternehmen',
    features: [
      'Unbegrenzte AI-Nachrichten',
      'Gemini 2.5 Pro Modell (erweitert)',
      'Priorität Support',
      'API Zugang (kommend)',
      'Erweiterte Analytik',
      'Team-Funktionen (kommend)',
    ],
    color: 'from-purple-500 to-pink-500',
    popular: true,
  }
};

export default function PostFinanceSubscribe() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (tier: 'ultra' | 'pro') => {
    if (!user) {
      window.location.href = '/api/login';
      return;
    }

    setIsLoading(tier);
    try {
      const response = await apiRequest('POST', '/api/postfinance/create-subscription', { tier });
      const data = await response.json();

      if (data.paymentUrl) {
        // Redirect to PostFinance Checkout
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('PostFinance subscription error:', error);
      toast({
        title: "Fehler bei der Zahlung",
        description: error.message || "Die PostFinance-Zahlung konnte nicht initialisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <SiPostman className="h-12 w-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold">PostFinance Zahlung</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bezahlen Sie sicher mit PostFinance - der offiziellen Schweizer Zahlungslösung
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <Badge variant="secondary" className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Schweizer Sicherheit
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              PostFinance Karte
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              Sofortige Aktivierung
            </Badge>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(POSTFINANCE_PLANS).map(([tier, plan]) => (
            <Card
              key={tier}
              className={`relative overflow-hidden ${
                plan.popular ? 'border-primary shadow-2xl scale-105' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                  Beliebt
                </div>
              )}
              
              <CardHeader>
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${plan.color} mb-4`} />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-[hsl(129.4118,100%,27.0588%)]">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[hsl(129.4118,100%,27.0588%)] mr-3 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(tier as 'ultra' | 'pro')}
                  disabled={isLoading === tier}
                  className="w-full bg-[hsl(129.4118,100%,27.0588%)] hover:bg-[hsl(129.4118,100%,22%)] text-white"
                  size="lg"
                >
                  {isLoading === tier ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Weiterleitung zu PostFinance...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <SiPostman className="h-5 w-5 mr-2" />
                      Mit PostFinance bezahlen
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">Unterstützte Zahlungsmethoden</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>PostFinance Karte</div>
            <div>PostFinance E-Finance</div>
            <div>Visa & Mastercard</div>
            <div>TWINT</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Sichere Zahlung über PostFinance Checkout. Ihre Daten werden gemäss Schweizer Datenschutzstandards geschützt.
          </p>
        </div>
      </div>
    </div>
  );
}