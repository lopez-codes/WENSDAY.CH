import { useState } from "react";
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
  Euro
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

  // Mock-Daten für die Crowdfunding-Kampagne
  const campaignData = {
    title: "wensday.ch - Schweizer KI-Revolution",
    goal: 250000,
    raised: 87500,
    backers: 342,
    daysLeft: 45,
    description: "Unterstützen Sie die Entwicklung der ersten vollständig schweizerischen KI-Plattform mit ethischen Standards und lokaler Datenhaltung."
  };

  const fundingTiers = [
    {
      id: "supporter",
      name: "Unterstützer",
      amount: 25,
      description: "Früher Zugang zur Beta-Version",
      rewards: ["Beta-Zugang", "Newsletter", "Community-Zugang"],
      backers: 89,
      popular: false
    },
    {
      id: "contributor", 
      name: "Beitragszahler",
      amount: 100,
      description: "Erweiterte Features und Support",
      rewards: ["Alle Supporter-Belohnungen", "Premium Support", "Feature-Voting"],
      backers: 156,
      popular: true
    },
    {
      id: "patron",
      name: "Gönner", 
      amount: 500,
      description: "Exklusiver Zugang und Beratung",
      rewards: ["Alle Beitragszahler-Belohnungen", "1:1 Beratungsstunde", "Firmen-Logo"],
      backers: 67,
      popular: false
    },
    {
      id: "enterprise",
      name: "Enterprise Partner",
      amount: 2500,
      description: "Private Installation verfügbar",
      rewards: ["Private Installation", "24/7 Support", "Custom Features", "Swiss-Hosting"],
      backers: 12,
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
                  wensday.ch revolutioniert die KI-Landschaft in der Schweiz. Wir entwickeln eine 
                  ethische, transparente und lokal gehostete KI-Plattform, die höchste Datenschutz-
                  und Sicherheitsstandards erfüllt.
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
                <p className="text-swiss-gray leading-relaxed">
                  Mit Ihrer Unterstützung können wir diese Vision Realität werden lassen und der 
                  Schweiz eine führende Position in der ethischen KI-Entwicklung verschaffen.
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

                <Button 
                  className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                  disabled={(!selectedTier && !customAmount) || isProcessing}
                  onClick={() => handlePledge()}
                >
                  {isProcessing ? "Verarbeitung..." : "Mit PostFinance unterstützen"}
                </Button>
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
                  <span>Läuft bis: 31. März 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-swiss-gray" />
                  <span>Zürich, Schweiz</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-swiss-gray" />
                  <span>Mindestfinanzierung: CHF 100'000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Updates Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-lopez-green" />
              Live-Updates & Community
            </CardTitle>
            <CardDescription>
              Verfolgen Sie den Fortschritt und diskutieren Sie mit anderen Unterstützern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">Letzte Updates</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-lopez-green pl-4">
                    <p className="text-sm font-medium">85% Meilenstein erreicht!</p>
                    <p className="text-xs text-swiss-gray">vor 2 Stunden</p>
                  </div>
                  <div className="border-l-4 border-gray-300 pl-4">
                    <p className="text-sm">Neue Enterprise-Features vorgestellt</p>
                    <p className="text-xs text-swiss-gray">vor 1 Tag</p>
                  </div>
                  <div className="border-l-4 border-gray-300 pl-4">
                    <p className="text-sm">PostFinance Integration vollständig getestet</p>
                    <p className="text-xs text-swiss-gray">vor 3 Tagen</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-3">Community-Feedback</h3>
                <Textarea 
                  placeholder="Teilen Sie Ihre Wünsche und Anregungen mit..."
                  className="mb-3"
                />
                <Button variant="outline" size="sm" className="w-full">
                  Feedback senden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}