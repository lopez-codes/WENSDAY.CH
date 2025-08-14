import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, 
  Zap, 
  Shield, 
  Code, 
  Database, 
  Webhook,
  AlertTriangle,
  Key,
  Cpu,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CoreAccess {
  status?: string;
  apiKey?: string;
  features?: {
    unlimited_access: boolean;
    direct_ki_integration: boolean;
    full_control_mode: boolean;
    custom_connectors?: boolean;
    raw_model_access?: boolean;
    has_api_key: boolean;
  };
  responsibility_notice?: string;
}

export default function WensdayCore() {
  const { user, isAuthenticated } = useAuth() as { user?: User; isAuthenticated: boolean };
  const { toast } = useToast();
  const [coreAccess, setCoreAccess] = useState<CoreAccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [directPrompt, setDirectPrompt] = useState("");
  const [directModel, setDirectModel] = useState("gemini-2.5-flash");
  const [directResponse, setDirectResponse] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && user?.subscriptionTier === 'wensday_core') {
      checkCoreAccess();
    }
  }, [isAuthenticated, user]);

  const checkCoreAccess = async () => {
    try {
      const response = await apiRequest("POST", "/api/core/access");
      const data = await response.json();
      setCoreAccess(data);
    } catch (error) {
      console.error("Core access check failed:", error);
    }
  };

  const activateCoreAccess = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/core/access");
      const data = await response.json();
      setCoreAccess(data);
      
      if (data.apiKey) {
        toast({
          title: "wensday-core aktiviert!",
          description: "Ihr persönlicher API-Schlüssel wurde generiert.",
        });
      }
    } catch (error) {
      toast({
        title: "Aktivierung fehlgeschlagen",
        description: "wensday-core Zugang konnte nicht aktiviert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeDirectAI = async () => {
    if (!directPrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/core/direct-ai", {
        prompt: directPrompt,
        model: directModel
      });
      const data = await response.json();
      setDirectResponse(data);
      
      if (data.success) {
        toast({
          title: "Direct AI Query erfolgreich",
          description: `Antwort von ${data.data.model} erhalten`,
        });
      } else {
        toast({
          title: "Direct AI Query fehlgeschlagen",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Direct AI Query konnte nicht ausgeführt werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">wensday-core</h1>
            <p className="text-xl text-muted-foreground">
              Bitte melden Sie sich an, um auf wensday-core zuzugreifen.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.subscriptionTier !== 'wensday_core') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">wensday-core</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Premium Developer Access erforderlich
            </p>
            <Alert className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                wensday-core ist nur für Premium Developer verfügbar. 
                Kontaktieren Sie uns für einen Upgrade.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="w-10 h-10 text-lopez-green" />
            <h1 className="text-4xl font-bold">wensday-core</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Premium Developer Access mit direkter KI-Integration und voller Kontrolle
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="bg-lopez-green text-white">
              Developer Edition
            </Badge>
          </div>
        </div>

        {/* Responsibility Warning */}
        <Alert className="mb-8 border-yellow-400 bg-yellow-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Vollständige Entwickler-Verantwortung:</strong> Mit wensday-core übernehmen Sie 
            100% Verantwortung für alle KI-Integrationen und -Ausgaben. Es gibt keine Ratenlimits, 
            aber auch keine Sicherheitsbeschränkungen.
          </AlertDescription>
        </Alert>

        {/* Core Access Status */}
        {!coreAccess && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-6 h-6 text-lopez-green" />
                Core Access aktivieren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Aktivieren Sie Ihren wensday-core Zugang, um direkten API-Zugriff zu erhalten.
              </p>
              <Button 
                onClick={activateCoreAccess}
                disabled={isLoading}
                className="bg-lopez-green hover:bg-lopez-green/90"
              >
                {isLoading ? "Aktiviere..." : "Core Access aktivieren"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Core Features Dashboard */}
        {coreAccess && (
          <Tabs defaultValue="status" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="direct-ai">Direct AI</TabsTrigger>
              <TabsTrigger value="batch">Batch</TabsTrigger>
              <TabsTrigger value="connectors">Connectors</TabsTrigger>
              <TabsTrigger value="raw-model">Raw Model</TabsTrigger>
            </TabsList>

            {/* Status Tab */}
            <TabsContent value="status">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-lopez-green" />
                      Access Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {coreAccess.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Unlimited Access:</span>
                      <Badge variant={coreAccess.features?.unlimited_access ? "default" : "secondary"}>
                        {coreAccess.features?.unlimited_access ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Integration:</span>
                      <Badge variant={coreAccess.features?.direct_ki_integration ? "default" : "secondary"}>
                        {coreAccess.features?.direct_ki_integration ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Control Mode:</span>
                      <Badge variant={coreAccess.features?.full_control_mode ? "default" : "secondary"}>
                        {coreAccess.features?.full_control_mode ? "✓" : "✗"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-lopez-green" />
                      API Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {coreAccess.apiKey ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Ihr persönlicher API-Schlüssel:
                        </p>
                        <code className="block p-2 bg-gray-100 rounded text-xs font-mono break-all">
                          {coreAccess.apiKey}
                        </code>
                        <p className="text-xs text-red-600">
                          ⚠️ Bewahren Sie diesen Schlüssel sicher auf!
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Kein API-Schlüssel generiert
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Direct AI Tab */}
            <TabsContent value="direct-ai">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-lopez-green" />
                    Direct AI Query
                  </CardTitle>
                  <CardDescription>
                    Direkter Zugriff auf KI-Modelle ohne Ratenlimits oder Qualitätskontrolle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={directModel}
                      onChange={(e) => setDirectModel(e.target.value)}
                      placeholder="gemini-2.5-flash"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      value={directPrompt}
                      onChange={(e) => setDirectPrompt(e.target.value)}
                      placeholder="Geben Sie Ihren direkten AI-Prompt ein..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={executeDirectAI}
                    disabled={isLoading || !directPrompt.trim()}
                    className="bg-lopez-green hover:bg-lopez-green/90"
                  >
                    {isLoading ? "Ausführen..." : "Direct AI Query"}
                  </Button>

                  {directResponse && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-semibold">Antwort:</h4>
                      {directResponse.success ? (
                        <div className="space-y-3">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm">
                              {directResponse.data.content}
                            </pre>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Model: {directResponse.data.model} | 
                            Tokens: {directResponse.usage?.tokensUsed} | 
                            Cost: ~CHF {directResponse.usage?.costEstimate}
                          </div>
                        </div>
                      ) : (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {directResponse.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder Tabs */}
            <TabsContent value="batch">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-lopez-green" />
                    Batch Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Batch-Verarbeitung für mehrere AI-Requests parallel. 
                    Funktionalität wird demnächst verfügbar sein.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connectors">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-6 h-6 text-lopez-green" />
                    Custom Connectors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Erstellen Sie eigene Connectoren für Webhooks, Datenbanken und APIs. 
                    Funktionalität wird demnächst verfügbar sein.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw-model">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-6 h-6 text-lopez-green" />
                    Raw Model Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Direkter Zugriff auf Modell-Parameter und erweiterte Konfigurationen. 
                    Funktionalität wird demnächst verfügbar sein.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}