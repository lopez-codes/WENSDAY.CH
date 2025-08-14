import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Shield, 
  Cloud, 
  Activity,
  Smartphone,
  Globe,
  Zap,
  Users,
  Settings,
  Lock
} from "lucide-react";

export default function FirebaseArchitecture() {
  const firebaseServices = [
    {
      name: "Firestore Database",
      icon: <Database className="w-6 h-6" />,
      description: "NoSQL Dokument-Datenbank für Crowdfunding-Daten",
      features: [
        "Echzeit-Synchronisation für Live-Updates",
        "Offline-Support für mobile Apps",
        "ACID-Transaktionen für Zahlungen",
        "Automatische Multi-Region-Replikation"
      ],
      pricing: "€0.18 pro 100K Operationen",
      swissCompliance: true
    },
    {
      name: "Authentication",
      icon: <Shield className="w-6 h-6" />,
      description: "Sichere Nutzeranmeldung für Investoren",
      features: [
        "Multi-Provider Login (Google, Email)",
        "2FA Support für Sicherheit",
        "JWT Token Management",
        "GDPR-konforme Nutzerdaten"
      ],
      pricing: "€0.0055 pro MAU (nach 50K kostenlos)",
      swissCompliance: true
    },
    {
      name: "Cloud Functions",
      icon: <Zap className="w-6 h-6" />,
      description: "Serverless Backend für Crowdfunding-Logic",
      features: [
        "PostFinance API Integration",
        "Email-Benachrichtigungen",
        "Automatische Backups",
        "Scheduled Tasks für Reports"
      ],
      pricing: "€0.40 pro 1M Aufrufe",
      swissCompliance: true
    },
    {
      name: "Hosting",
      icon: <Globe className="w-6 h-6" />,
      description: "Globales CDN für React/Flutter Apps",
      features: [
        "SSL-Zertifikate automatisch",
        "Custom Domain Support",
        "Atomic Deployments",
        "Rollback-Funktionalität"
      ],
      pricing: "€0.026 pro GB Storage",
      swissCompliance: true
    },
    {
      name: "Cloud Storage",
      icon: <Cloud className="w-6 h-6" />,
      description: "Sichere Dateispeicherung",
      features: [
        "Verschlüsselte Dateispeicherung",
        "Automatische Bildoptimierung",
        "Granulare Zugriffskontrollen",
        "Backup & Restore"
      ],
      pricing: "€0.026 pro GB/Monat",
      swissCompliance: true
    },
    {
      name: "Analytics",
      icon: <Activity className="w-6 h-6" />,
      description: "Nutzerverhalten und Crowdfunding-Metriken",
      features: [
        "Echtzeit-Nutzerstatistiken",
        "Conversion-Tracking",
        "Funnel-Analyse für Investments",
        "Custom Events für Business Logic"
      ],
      pricing: "Kostenlos",
      swissCompliance: true
    }
  ];

  const architectureBenefits = [
    {
      title: "Schweizer Datenschutz",
      description: "Google Cloud Zürich Region für lokale Datenhaltung",
      icon: <Lock className="w-5 h-5 text-lopez-green" />
    },
    {
      title: "Mobile-First",
      description: "Native Flutter Integration für iOS/Android Apps",
      icon: <Smartphone className="w-5 h-5 text-lopez-green" />
    },
    {
      title: "Automatische Skalierung",
      description: "Keine Infrastruktur-Wartung bei Nutzerwachstum",
      icon: <Settings className="w-5 h-5 text-lopez-green" />
    },
    {
      title: "Enterprise-Ready",
      description: "99.99% SLA und 24/7 Google Support verfügbar",
      icon: <Shield className="w-5 h-5 text-lopez-green" />
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Firebase <span className="text-lopez-green">Architektur</span>
        </h2>
        <p className="text-swiss-gray max-w-2xl mx-auto">
          Vollständige technische Architektur für die wensday GmbH Crowdfunding-Plattform 
          mit Firebase als Backend-as-a-Service
        </p>
        <Badge variant="outline" className="mt-2">
          <Cloud className="w-4 h-4 mr-1" />
          Google Cloud Zürich Region
        </Badge>
      </div>

      {/* Firebase Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {firebaseServices.map((service, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-lopez-green text-white">
                    {service.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.swissCompliance && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Swiss Compliant
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Features:</h4>
                  <ul className="text-xs text-swiss-gray space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-lopez-green rounded-full mt-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div className="text-xs">
                  <span className="font-medium">Pricing: </span>
                  <span className="text-lopez-green">{service.pricing}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Architecture Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Warum Firebase für wensday GmbH?</CardTitle>
          <CardDescription>
            Strategische Vorteile für die Schweizer Crowdfunding-Plattform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {architectureBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                {benefit.icon}
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-swiss-gray">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-lopez-green" />
            Technische Umsetzung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Flutter Mobile Apps</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="text-green-600">// Firebase Flutter Integration</div>
                <div>firebase_core: ^2.24.2</div>
                <div>cloud_firestore: ^4.13.6</div>
                <div>firebase_auth: ^4.15.3</div>
                <div>firebase_analytics: ^10.7.4</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">React Web Dashboard</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="text-green-600">// Firebase Web SDK</div>
                <div>import {`{ initializeApp }`} from 'firebase/app';</div>
                <div>import {`{ getFirestore }`} from 'firebase/firestore';</div>
                <div>import {`{ getAuth }`} from 'firebase/auth';</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">PostFinance Integration</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="text-green-600">// Cloud Function für Zahlungen</div>
                <div>exports.processPayment = functions.https.onCall()</div>
                <div>  // PostFinance Checkout API</div>
                <div>  // Firestore Transaction Update</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-lopez-green" />
            Migration Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-lopez-green text-white">Phase 1</Badge>
              <div>
                <h4 className="font-semibold">Firebase Setup & Configuration</h4>
                <p className="text-sm text-swiss-gray">
                  Google Cloud Zürich Region, Security Rules, Initial Collections
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline">Phase 2</Badge>
              <div>
                <h4 className="font-semibold">Data Migration</h4>
                <p className="text-sm text-swiss-gray">
                  Crowdfunding-Daten, User Profiles, Investment Records
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline">Phase 3</Badge>
              <div>
                <h4 className="font-semibold">Flutter App Development</h4>
                <p className="text-sm text-swiss-gray">
                  iOS/Android Apps mit Firebase Integration
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}