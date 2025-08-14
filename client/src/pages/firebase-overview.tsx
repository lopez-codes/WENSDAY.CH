import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FirebaseCostCalculator from "@/components/firebase/firebase-cost-calculator";
import FirebaseArchitecture from "@/components/firebase/firebase-architecture";
import { 
  Cloud, 
  Calculator, 
  Building,
  Smartphone,
  Database,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function FirebaseOverview() {
  const [activeTab, setActiveTab] = useState<'costs' | 'architecture'>('costs');

  const tabs = [
    {
      id: 'costs' as const,
      label: 'Kostenrechner',
      icon: <Calculator className="w-4 h-4" />,
      description: 'Monatliche Firebase-Kosten für Crowdfunding'
    },
    {
      id: 'architecture' as const,
      label: 'Architektur',
      icon: <Building className="w-4 h-4" />,
      description: 'Technische Firebase-Komponenten'
    }
  ];

  const firebaseFeatures = [
    {
      icon: <Database className="w-8 h-8 text-lopez-green" />,
      title: "Echzeit-Datenbank",
      description: "Live-Updates für Crowdfunding-Progress und Investoren-Dashboard"
    },
    {
      icon: <Shield className="w-8 h-8 text-lopez-green" />,
      title: "Swiss-Hosted",
      description: "Google Cloud Zürich Region für Schweizer Datenschutz-Compliance"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-lopez-green" />,
      title: "Mobile-Ready",
      description: "Native Flutter Integration für iOS/Android Crowdfunding-Apps"
    }
  ];

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
              <Cloud className="w-4 h-4 mr-1" />
              Firebase Backend-as-a-Service
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              Firebase für <span className="text-lopez-green">wensday GmbH</span>
            </h1>
            <p className="text-xl text-swiss-gray mb-6 max-w-3xl mx-auto">
              Theoretische Firebase-Komponenten und monatliche Kostenberechnung 
              für die 30 Millionen CHF Crowdfunding-Plattform
            </p>
          </motion.div>
        </div>

        {/* Quick Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {firebaseFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-swiss-gray">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.id ? "bg-lopez-green hover:bg-lopez-green-dark" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <CardTitle>
                {tabs.find(tab => tab.id === activeTab)?.label}
              </CardTitle>
              <p className="text-swiss-gray text-sm">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'costs' && <FirebaseCostCalculator />}
          {activeTab === 'architecture' && <FirebaseArchitecture />}
        </motion.div>

        {/* Integration Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-6 h-6 text-lopez-green" />
              Firebase Integration Vorteile für wensday GmbH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3 text-lopez-green">Geschäftliche Vorteile</h3>
                <ul className="space-y-2 text-sm text-swiss-gray">
                  <li>• Reduzierte Entwicklungszeit und -kosten</li>
                  <li>• Automatische Skalierung mit Nutzer-Wachstum</li>
                  <li>• Keine Infrastruktur-Wartung erforderlich</li>
                  <li>• Enterprise-SLA von 99.99% Verfügbarkeit</li>
                  <li>• Integrierte Analytics für Business Intelligence</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3 text-lopez-green">Technische Vorteile</h3>
                <ul className="space-y-2 text-sm text-swiss-gray">
                  <li>• Echzeit-Synchronisation für Live-Updates</li>
                  <li>• Offline-Support für mobile Anwendungen</li>
                  <li>• Automatische Backups und Disaster Recovery</li>
                  <li>• GDPR-konforme Datenhaltung in der Schweiz</li>
                  <li>• Nahtlose Flutter/React Integration</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-lopez-green bg-opacity-10 border border-lopez-green rounded-lg">
              <h4 className="font-bold text-lopez-green mb-2">ROI für 30M CHF Investment</h4>
              <p className="text-sm text-swiss-gray">
                Firebase reduziert die Backend-Entwicklungskosten um 60-80% und ermöglicht eine 
                schnellere Time-to-Market für die Crowdfunding-Plattform. Die geschätzten 
                jährlichen Firebase-Kosten von ~$15,000 entsprechen nur 0.05% des 30M CHF Budgets.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}