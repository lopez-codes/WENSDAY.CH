import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Heart, 
  Target, 
  Users, 
  Crown, 
  Globe, 
  Sparkles, 
  Gift,
  Calendar,
  MapPin,
  Euro,
  Activity,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function Crowdfunding() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePledge = async () => {
    if (!selectedTier && !customAmount) return;
    
    setIsProcessing(true);
    try {
      const selectedTierData = fundingTiers.find(tier => tier.id === selectedTier);
      const pledgeAmount = customAmount ? parseInt(customAmount) : selectedTierData?.amount;
      
      const response = await fetch('/api/crowdfunding/pledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierType: selectedTier,
          amount: pledgeAmount,
          customAmount: customAmount ? parseInt(customAmount) : null,
          userInfo: {
            timestamp: Date.now(),
            referrer: window.location.href
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // In real implementation, redirect to PostFinance Checkout
        alert(`Vielen Dank! Ihre Unterstützung von CHF ${pledgeAmount} wird verarbeitet. Pledge ID: ${result.pledgeId}`);
        setSelectedTier(null);
        setCustomAmount("");
      } else {
        throw new Error('Pledge failed');
      }
    } catch (error) {
      console.error('Pledge error:', error);
      alert('Fehler beim Verarbeiten der Unterstützung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Live-KI optimierte Finanzierungsdaten für wensday GmbH Gründung
  const [campaignData, setCampaignData] = useState({
    title: "wensday GmbH - Schweizer KI-Revolution",
    goal: 30000000, // 30 Millionen CHF für Gründung und Team
    raised: 2750000, // Bereits zugesagte Mittel - wird live aktualisiert
    backers: 127,
    daysLeft: 180, // 6 Monate Finanzierungsrunde
    description: "Selbsttragende Crowdfunding-Plattform mit KI-Komponenten für die wensday GmbH Gründung - 30 Millionen CHF für Team, Standort und ethische KI-Entwicklung."
  });

  // Live-Updates alle 30 Sekunden simulieren
  useEffect(() => {
    const interval = setInterval(() => {
      setCampaignData(prev => ({
        ...prev,
        raised: prev.raised + Math.floor(Math.random() * 5000), // Live KI-Updates
        backers: prev.backers + Math.floor(Math.random() * 2)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fundingTiers = [
    {
      id: "community",
      name: "Community Investor",
      amount: 1000,
      description: "Unterstützen Sie die Gründung der wensday GmbH",
      rewards: ["Investor-Updates", "Beta-Zugang", "Community-Events", "wensday GmbH Newsletter"],
      backers: 45,
      popular: false
    },
    {
      id: "business", 
      name: "Business Partner",
      amount: 5000,
      description: "Geschäftspartnerschaft mit der wensday GmbH",
      rewards: ["Alle Community-Belohnungen", "Geschäftsberatung", "API-Zugang", "Partner-Status"],
      backers: 28,
      popular: true
    },
    {
      id: "strategic",
      name: "Strategischer Investor", 
      amount: 25000,
      description: "Strategische Beteiligung an der wensday GmbH",
      rewards: ["Alle Business-Belohnungen", "Quartals-Meetings", "Produkt-Roadmap Input", "Firmen-Logo"],
      backers: 18,
      popular: false
    },
    {
      id: "institutional",
      name: "Institutioneller Investor",
      amount: 100000,
      description: "Institutionelle Beteiligung - Weg zu 30 Millionen CHF",
      rewards: ["Private Meetings", "Board-Observer Status", "Custom Solutions", "Swiss-Hosting Priority"],
      backers: 8,
      popular: false
    },
    {
      id: "founder",
      name: "Co-Founder Investment",
      amount: 500000,
      description: "Mitgründer-Level Investment für wensday GmbH",
      rewards: ["Equity-Beteiligung", "Board-Sitz", "Strategic Decision Making", "Revenue Sharing"],
      backers: 3,
      popular: false
    }
  ];

  const progress = (campaignData.raised / campaignData.goal) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4">
              <Heart className="w-4 h-4 mr-1 text-red-500" />
              Crowdfunding Aktiv
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Unterstützen Sie die <span className="text-lopez-green">Schweizer KI-Zukunft</span>
            </h1>
            <p className="text-xl text-swiss-gray mb-6 max-w-3xl mx-auto">
              {campaignData.description}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Campaign Stats */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-lopez-green" />
                  Kampagnen-Fortschritt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl font-bold text-lopez-green">
                        CHF {campaignData.raised.toLocaleString()}
                      </span>
                      <span className="text-swiss-gray">
                        von CHF {campaignData.goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3 mb-4" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-lopez-green">
                          {Math.round(progress)}%
                        </div>
                        <div className="text-sm text-swiss-gray">Finanziert</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-lopez-green">
                          {campaignData.backers}
                        </div>
                        <div className="text-sm text-swiss-gray">Unterstützer</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-lopez-green">
                          {campaignData.daysLeft}
                        </div>
                        <div className="text-sm text-swiss-gray">Tage verbleibend</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Story */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Unsere Vision</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-swiss-gray leading-relaxed mb-4">
                  Die <strong>wensday GmbH</strong> wird mit einem Zielkapital von <strong>30 Millionen CHF</strong> 
                  gegründet, um ein erstklassiges Entwicklerteam aufzubauen und einen vollständig 
                  schweizerischen KI-Standort zu etablieren. Diese Finanzierung ermöglicht es uns, 
                  2-3 Top-Entwickler einzustellen und eine führende Position in der ethischen KI-Entwicklung einzunehmen.
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="flex items-start gap-3">
                    <Globe className="w-6 h-6 text-lopez-green mt-1" />
                    <div>
                      <h3 className="font-bold mb-2">Swiss-Hosting</h3>
                      <p className="text-sm text-swiss-gray">
                        Alle Daten verbleiben in der Schweiz und unterliegen schweizerischem Recht.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-lopez-green mt-1" />
                    <div>
                      <h3 className="font-bold mb-2">Ethische KI</h3>
                      <p className="text-sm text-swiss-gray">
                        Transparenz und Fairness stehen im Mittelpunkt unserer Entwicklung.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-lopez-green bg-opacity-10 border border-lopez-green rounded-lg p-4 my-4">
                  <h4 className="font-bold text-lopez-green mb-2">30 Millionen CHF Finanzierungsziel</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• CHF 12M - Top-Entwicklerteam (2-3 Senior Engineers)</li>
                    <li>• CHF 8M - Schweizer Firmenstandort und Infrastruktur</li>
                    <li>• CHF 6M - KI-Forschung und Entwicklung</li>
                    <li>• CHF 4M - Rechtliche Struktur und Compliance</li>
                  </ul>
                </div>
                <p className="text-swiss-gray leading-relaxed">
                  Ihre Investition fließt direkt in die offizielle Gründung der wensday GmbH und 
                  den Aufbau eines weltklasse Schweizer KI-Unternehmens mit ethischen Standards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Funding Tiers */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-lopez-green" />
                  Unterstützungs-Pakete
                </CardTitle>
                <CardDescription>
                  Wählen Sie Ihr bevorzugtes Unterstützungspaket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fundingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedTier === tier.id ? 'border-lopez-green bg-green-50' : 'border-gray-200'
                    } ${tier.popular ? 'ring-2 ring-lopez-green' : ''}`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold flex items-center gap-2">
                          {tier.name}
                          {tier.popular && <Badge className="text-xs bg-lopez-green">Beliebt</Badge>}
                          {tier.id === "enterprise" && <Crown className="w-4 h-4 text-yellow-500" />}
                        </h3>
                        <p className="text-2xl font-bold text-lopez-green">
                          CHF {tier.amount}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tier.backers} Unterstützer
                      </Badge>
                    </div>
                    <p className="text-sm text-swiss-gray mb-3">{tier.description}</p>
                    <div className="space-y-1">
                      {tier.rewards.map((reward, index) => (
                        <div key={index} className="text-xs text-swiss-gray flex items-center gap-1">
                          <span className="w-1 h-1 bg-lopez-green rounded-full"></span>
                          {reward}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom Amount */}
                <div className="border-t pt-4">
                  <Label htmlFor="custom-amount" className="text-sm font-medium">
                    Oder eigenen Betrag eingeben
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-swiss-gray" />
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Betrag in CHF"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                    disabled={(!selectedTier && !customAmount) || isProcessing}
                    onClick={() => handlePledge()}
                  >
                    {isProcessing ? "Verarbeitung..." : "Mit PostFinance unterstützen"}
                  </Button>
                  
                  {(selectedTier || customAmount) && (
                    <div className="text-xs text-swiss-gray space-y-1 p-3 bg-blue-50 rounded border">
                      <p className="font-medium">📋 Nächste Schritte nach Zahlung:</p>
                      <p>• ID-Verifizierung (3 Tage für größere Beträge)</p>
                      <p>• Zugang zu Live-KI Updates</p>
                      <p>• Community-Mitgliedschaft</p>
                      <p>• Investor-Dashboard freischalten</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kampagnen-Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-swiss-gray" />
                  <span>Series A Runde bis: 31. August 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-swiss-gray" />
                  <span>Zürich, Schweiz</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-swiss-gray" />
                  <span>Ziel: CHF 30'000'000 für wensday GmbH Gründung</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Updates & Self-Sustaining Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-lopez-green" />
              Live KI-Updates & Selbsttragend
            </CardTitle>
            <CardDescription>
              Echtzeit-Updates mit KI-Komponenten für selbsttragende Crowdfunding-Plattform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-lopez-green" />
                  Live KI-Updates
                </h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-lopez-green pl-4 bg-green-50 p-3 rounded">
                    <p className="text-sm font-medium">KI analysiert: +15% Investoren heute</p>
                    <p className="text-xs text-swiss-gray">vor 12 Minuten • KI-Prognose</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded">
                    <p className="text-sm">Optimaler Zeitpunkt: Nächste 3 Tage</p>
                    <p className="text-xs text-swiss-gray">vor 1 Stunde • KI-Empfehlung</p>
                  </div>
                  <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded">
                    <p className="text-sm">Firebase-Kosten steigen bei 2K Nutzern</p>
                    <p className="text-xs text-swiss-gray">vor 2 Stunden • Cost-KI</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-lopez-green" />
                  Aktive Community
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-lopez-green text-white rounded-full flex items-center justify-center text-xs font-bold">
                        MR
                      </div>
                      <div>
                        <p className="text-sm font-medium">Marco R.</p>
                        <p className="text-xs text-swiss-gray">CHF 25'000 • vor 1h</p>
                      </div>
                    </div>
                    <Badge className="bg-lopez-green text-white text-xs">Verifiziert</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        AS
                      </div>
                      <div>
                        <p className="text-sm font-medium">Anna S.</p>
                        <p className="text-xs text-swiss-gray">CHF 5'000 • vor 3h</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">ID-Prüfung</Badge>
                  </div>
                  
                  <Button size="sm" className="w-full bg-lopez-green hover:bg-lopez-green-dark">
                    Community beitreten
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-lopez-green" />
                  ID-Verifizierung
                </h3>
                <div className="space-y-3">
                  <div className="p-3 border-2 border-lopez-green rounded-lg bg-green-50">
                    <h4 className="font-medium text-sm mb-1">3-Tage Verifizierung</h4>
                    <p className="text-xs text-swiss-gray mb-2">
                      Langfristige Kundenbindung über ID-Verifizierung für größere Investments
                    </p>
                    <Badge className="text-xs bg-lopez-green text-white">Swiss-KYC</Badge>
                  </div>
                  
                  <div className="text-xs space-y-1 text-swiss-gray">
                    <p>• Stufe 1: Email & Telefon (1K-5K CHF)</p>
                    <p>• Stufe 2: Swiss-ID (5K-25K CHF)</p>
                    <p>• Stufe 3: Bankkonto (25K+ CHF)</p>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    ID jetzt verifizieren
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Self-Sustaining Revenue Model */}
            <div className="mt-8 p-6 bg-gradient-to-r from-lopez-green/10 to-blue-500/10 border border-lopez-green rounded-lg">
              <h4 className="font-bold text-lopez-green mb-3">Selbsttragende Plattform-Ökonomie</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">KI-Services Revenue</h5>
                  <ul className="text-swiss-gray space-y-1">
                    <li>• Premium KI-Analyse: CHF 50/Monat</li>
                    <li>• Business Predictions: CHF 200/Monat</li>
                    <li>• Custom Reports: CHF 500/Monat</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Platform Fees</h5>
                  <ul className="text-swiss-gray space-y-1">
                    <li>• Transaktionsgebühr: 2.5%</li>
                    <li>• Success Fee: 5% bei Ziel-Erreichung</li>
                    <li>• Verifizierung: CHF 25 einmalig</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Enterprise Services</h5>
                  <ul className="text-swiss-gray space-y-1">
                    <li>• White-Label: CHF 10K/Jahr</li>
                    <li>• API Access: CHF 1K/Monat</li>
                    <li>• Custom Integration: CHF 50K</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}