import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Per month",
    features: [
      "10 messages per day",
      "Basic AI model access",
      "Swiss data hosting",
    ],
    restrictions: [
      "Chat history",
    ],
    buttonText: "Get Started",
    buttonAction: () => window.location.href = '/api/login',
    buttonVariant: "outline" as const,
  },
  {
    name: "Ultra Access",
    price: 29,
    description: "Per month",
    popular: true,
    features: [
      "500 messages per day",
      "All AI models",
      "Full chat history",
      "Priority support",
    ],
    restrictions: [],
    buttonText: "Upgrade Now",
    buttonAction: () => window.location.href = '/subscribe',
    buttonVariant: "default" as const,
  },
  {
    name: "Pro",
    price: 99,
    description: "Per month",
    features: [
      "Unlimited messages",
      "All AI models + Beta access",
      "Advanced analytics",
      "API access",
    ],
    restrictions: [],
    buttonText: "Contact Sales",
    buttonAction: () => window.location.href = '/subscribe',
    buttonVariant: "secondary" as const,
  },
];

export default function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {plans.map((plan, index) => (
        <Card 
          key={plan.name} 
          className={`relative hover:shadow-lg transition-all ${
            plan.popular ? 'border-2 border-lopez-green transform scale-105' : 'border-2 border-gray-200'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-lopez-green text-white px-4 py-2">
                Most Popular
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              {plan.name}
            </CardTitle>
            <div className={`text-4xl font-bold mb-2 ${
              plan.popular ? 'text-lopez-green' : 'text-gray-900'
            }`}>
              CHF {plan.price}
            </div>
            <p className="text-swiss-gray">{plan.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-4">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-lopez-green flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
              {plan.restrictions.map((restriction, restrictionIndex) => (
                <li key={restrictionIndex} className="flex items-center space-x-3">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400">{restriction}</span>
                </li>
              ))}
            </ul>

            <Button 
              variant={plan.buttonVariant}
              className={`w-full py-3 font-semibold transition-colors ${
                plan.buttonVariant === 'default' 
                  ? 'bg-lopez-green text-white hover:bg-lopez-green-dark' 
                  : plan.buttonVariant === 'secondary'
                  ? 'bg-swiss-blue text-white hover:bg-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={plan.buttonAction}
            >
              {plan.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
