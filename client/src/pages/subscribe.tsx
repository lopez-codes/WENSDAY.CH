import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

// Stripe keys will be configured later
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('VITE_STRIPE_PUBLIC_KEY not configured - payment processing disabled');
}
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

const PRICING_PLANS = {
  ultra: {
    name: 'Ultra Access',
    price: 29,
    priceId: 'price_ultra_chf', // This would be set in environment
    features: [
      '500 messages per day',
      'All AI models',
      'Full chat history',
      'Priority support',
    ],
    restrictions: [
      'API access',
    ]
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: 'price_pro_chf', // This would be set in environment
    features: [
      'Unlimited messages',
      'All AI models + Beta access',
      'Advanced analytics',
      'API access',
      'Premium support',
    ],
    restrictions: []
  }
};

const SubscribeForm = ({ tier }: { tier: 'ultra' | 'pro' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-lopez-green hover:bg-lopez-green-dark"
      >
        {isLoading ? 'Processing...' : `Subscribe to ${PRICING_PLANS[tier].name}`}
      </Button>
    </form>
  );
};

function SubscribePage() {
  const [selectedTier, setSelectedTier] = useState<'ultra' | 'pro' | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTier) {
      const plan = PRICING_PLANS[selectedTier];
      apiRequest("POST", "/api/create-subscription", { 
        priceId: plan.priceId,
        tier: selectedTier 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
          setSelectedTier(null);
        });
    }
  }, [selectedTier, toast]);

  if (selectedTier && clientSecret) {
    return (
      <div className="min-h-screen bg-swiss-light">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Complete Your Subscription
              </CardTitle>
              <p className="text-center text-swiss-gray">
                {PRICING_PLANS[selectedTier].name} - CHF {PRICING_PLANS[selectedTier].price}/month
              </p>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm tier={selectedTier} />
              </Elements>
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTier(null)}
                >
                  Back to Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swiss-light">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-swiss-gray">
            Upgrade to unlock the full potential of Swiss AI Chat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Ultra Access */}
          <Card className="relative border-2 border-lopez-green transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-lopez-green text-white px-4 py-2">
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl text-gray-900">Ultra Access</CardTitle>
              <div className="text-4xl font-bold text-lopez-green mt-4">
                CHF {PRICING_PLANS.ultra.price}
                <span className="text-lg text-swiss-gray font-normal">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {PRICING_PLANS.ultra.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lopez-green" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                {PRICING_PLANS.ultra.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <X className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">{restriction}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-lopez-green hover:bg-lopez-green-dark text-white"
                onClick={() => setSelectedTier('ultra')}
              >
                Upgrade to Ultra
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Pro</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-4">
                CHF {PRICING_PLANS.pro.price}
                <span className="text-lg text-swiss-gray font-normal">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {PRICING_PLANS.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-lopez-green" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-swiss-blue hover:bg-blue-800 text-white"
                onClick={() => setSelectedTier('pro')}
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-swiss-gray">
            All payments processed securely through Stripe. Swiss VAT included.
          </p>
          <p className="text-sm text-swiss-gray">
            Cancel anytime. No long-term contracts.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SubscribePage;
