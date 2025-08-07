import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-700 dark:text-red-300">
            Zahlung fehlgeschlagen
          </CardTitle>
          <CardDescription>
            Ihre Zahlung konnte nicht verarbeitet werden.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Es gab ein Problem bei der Verarbeitung Ihrer Zahlung. Bitte versuchen Sie es erneut oder kontaktieren Sie unseren Support.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/postfinance-subscribe'}
              className="w-full bg-[hsl(129.4118,100%,27.0588%)] hover:bg-[hsl(129.4118,100%,22%)] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Erneut versuchen
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