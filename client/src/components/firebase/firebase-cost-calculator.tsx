import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Users, 
  Cloud, 
  Activity,
  DollarSign,
  TrendingUp,
  Settings,
  Zap
} from "lucide-react";

interface FirebaseCostBreakdown {
  firestore: number;
  authentication: number;
  hosting: number;
  functions: number;
  storage: number;
  analytics: number;
  total: number;
}

interface CrowdfundingMetrics {
  totalBackers: number;
  monthlyActiveUsers: number;
  documentsPerUser: number;
  storagePerUserMB: number;
  functionCalls: number;
}

export default function FirebaseCostCalculator() {
  const [metrics, setMetrics] = useState<CrowdfundingMetrics>({
    totalBackers: 500,
    monthlyActiveUsers: 1200,
    documentsPerUser: 15,
    storagePerUserMB: 50,
    functionCalls: 25000
  });

  const [costs, setCosts] = useState<FirebaseCostBreakdown>({
    firestore: 0,
    authentication: 0,
    hosting: 0,
    functions: 0,
    storage: 0,
    analytics: 0,
    total: 0
  });

  // Firebase Pricing (USD per month)
  const pricing = {
    firestore: {
      documents: 0.18 / 100000, // per 100k document operations
      storage: 0.18 / (1024), // per GB stored
    },
    auth: {
      users: 0.0055, // per monthly active user (after 50k free)
      freeUsers: 50000
    },
    hosting: {
      storage: 0.026 / 1024, // per GB stored
      transfer: 0.15 / 1024, // per GB transferred
    },
    functions: {
      invocations: 0.40 / 1000000, // per 1M invocations
      computeTime: 0.0000025, // per 100ms
      freeInvocations: 2000000
    },
    storage: {
      stored: 0.026 / 1024, // per GB stored
      operations: 0.05 / 10000, // per 10k operations
    }
  };

  const calculateCosts = () => {
    // Firestore costs
    const totalDocuments = metrics.monthlyActiveUsers * metrics.documentsPerUser;
    const firestoreCost = (totalDocuments * pricing.firestore.documents) + 
                         ((totalDocuments * 0.001) * pricing.firestore.storage); // Assume 1KB per doc

    // Authentication costs
    const authCost = Math.max(0, (metrics.monthlyActiveUsers - pricing.auth.freeUsers) * pricing.auth.users);

    // Hosting costs (assume 10GB storage, 100GB transfer)
    const hostingCost = (10 * pricing.hosting.storage) + (100 * pricing.hosting.transfer);

    // Cloud Functions costs
    const functionCost = Math.max(0, (metrics.functionCalls - pricing.functions.freeInvocations) * pricing.functions.invocations) +
                        (metrics.functionCalls * 0.1 * pricing.functions.computeTime); // Assume 100ms avg execution

    // Storage costs
    const totalStorageGB = (metrics.monthlyActiveUsers * metrics.storagePerUserMB) / 1024;
    const storageCost = (totalStorageGB * pricing.storage.stored) + 
                       ((metrics.functionCalls * 0.1) * pricing.storage.operations);

    // Analytics is free
    const analyticsCost = 0;

    const totalCost = firestoreCost + authCost + hostingCost + functionCost + storageCost + analyticsCost;

    setCosts({
      firestore: firestoreCost,
      authentication: authCost,
      hosting: hostingCost,
      functions: functionCost,
      storage: storageCost,
      analytics: analyticsCost,
      total: totalCost
    });
  };

  useEffect(() => {
    calculateCosts();
  }, [metrics]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleMetricChange = (key: keyof CrowdfundingMetrics, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Firebase <span className="text-lopez-green">Kostenrechner</span>
        </h2>
        <p className="text-swiss-gray">
          Monatliche Firebase-Kosten für wensday.ch Crowdfunding-Plattform
        </p>
        <Badge variant="outline" className="mt-2">
          <Cloud className="w-4 h-4 mr-1" />
          Google Cloud Firebase
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-lopez-green" />
              Plattform-Metriken
            </CardTitle>
            <CardDescription>
              Passen Sie die Parameter an Ihre Crowdfunding-Anforderungen an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backers">Gesamtanzahl Unterstützer</Label>
              <Input
                id="backers"
                type="number"
                value={metrics.totalBackers}
                onChange={(e) => handleMetricChange('totalBackers', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="mau">Monatlich aktive Nutzer</Label>
              <Input
                id="mau"
                type="number"
                value={metrics.monthlyActiveUsers}
                onChange={(e) => handleMetricChange('monthlyActiveUsers', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="docs">Dokumente pro Nutzer/Monat</Label>
              <Input
                id="docs"
                type="number"
                value={metrics.documentsPerUser}
                onChange={(e) => handleMetricChange('documentsPerUser', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="storage">Storage pro Nutzer (MB)</Label>
              <Input
                id="storage"
                type="number"
                value={metrics.storagePerUserMB}
                onChange={(e) => handleMetricChange('storagePerUserMB', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="functions">Function Calls/Monat</Label>
              <Input
                id="functions"
                type="number"
                value={metrics.functionCalls}
                onChange={(e) => handleMetricChange('functionCalls', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-lopez-green" />
              Monatliche Kosten
            </CardTitle>
            <CardDescription>
              Firebase-Services Kostenaufschlüsselung (USD)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-swiss-gray" />
                  <span className="text-sm">Firestore Database</span>
                </div>
                <span className="font-medium">{formatCurrency(costs.firestore)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-swiss-gray" />
                  <span className="text-sm">Authentication</span>
                </div>
                <span className="font-medium">{formatCurrency(costs.authentication)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-swiss-gray" />
                  <span className="text-sm">Hosting</span>
                </div>
                <span className="font-medium">{formatCurrency(costs.hosting)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-swiss-gray" />
                  <span className="text-sm">Cloud Functions</span>
                </div>
                <span className="font-medium">{formatCurrency(costs.functions)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-swiss-gray" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="font-medium">{formatCurrency(costs.storage)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-swiss-gray" />
                  <span className="text-sm">Analytics</span>
                </div>
                <span className="font-medium text-green-600">Kostenlos</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Gesamtkosten/Monat</span>
                <span className="text-lopez-green">{formatCurrency(costs.total)}</span>
              </div>
              
              <div className="text-sm text-swiss-gray">
                Jährliche Kosten: <strong>{formatCurrency(costs.total * 12)}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Impact on Crowdfunding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-lopez-green" />
            Auswirkung auf Crowdfunding-Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-lopez-green mb-2">
                {formatCurrency(costs.total * 12)}
              </div>
              <div className="text-sm text-swiss-gray">Firebase Kosten/Jahr</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-lopez-green mb-2">
                {((costs.total * 12 / 30000000) * 100).toFixed(3)}%
              </div>
              <div className="text-sm text-swiss-gray">von 30M CHF Budget</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-lopez-green mb-2">
                {formatCurrency(costs.total / metrics.monthlyActiveUsers)}
              </div>
              <div className="text-sm text-swiss-gray">Kosten pro aktiver Nutzer</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-lopez-green bg-opacity-10 border border-lopez-green rounded-lg">
            <h4 className="font-bold text-lopez-green mb-2">Kostenoptimierung für wensday GmbH</h4>
            <ul className="text-sm text-swiss-gray space-y-1">
              <li>• Firebase-Kosten sind minimal im Vergleich zu 30M CHF Budget</li>
              <li>• Skaliert automatisch mit Nutzeranzahl</li>
              <li>• Keine Infrastruktur-Wartung erforderlich</li>
              <li>• Swiss-Hosting über Google Cloud Zürich möglich</li>
              <li>• Enterprise-Support verfügbar für Compliance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}