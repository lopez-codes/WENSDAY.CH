import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, Lock, Eye, Globe, FileText } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Datenschutzerklärung
          </h1>
          <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
            Schweizer Datenschutz-Standards für höchste Sicherheit Ihrer Daten
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-lopez-green text-white">Swiss DSG konform</Badge>
            <Badge className="bg-lopez-green text-white">GDPR compliant</Badge>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-lopez-green" />
              Datenschutz-Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-swiss-gray mb-4">
              wensday GmbH nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung 
              informiert Sie über die Art, den Umfang und den Zweck der Verarbeitung personenbezogener Daten 
              auf unserer Website und in unseren Diensten.
            </p>
            <p className="text-swiss-gray">
              Als Schweizer Unternehmen unterliegen wir dem Schweizer Datenschutzgesetz (DSG) sowie der 
              EU-Datenschutz-Grundverordnung (GDPR) für EU-Kunden.
            </p>
          </CardContent>
        </Card>

        {/* Data Processing Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-6 h-6 text-lopez-green" />
                Datenverarbeitung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Hosting-Standort</h4>
                <p className="text-sm text-swiss-gray">Schweiz / EU (Google Cloud Zürich)</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Datenübertragung</h4>
                <p className="text-sm text-swiss-gray">End-to-End verschlüsselt (TLS 1.3)</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Speicherdauer</h4>
                <p className="text-sm text-swiss-gray">Minimal notwendige Zeit</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-lopez-green" />
                Sicherheitsmaßnahmen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm">Verschlüsselung</h4>
                <p className="text-sm text-swiss-gray">AES-256 für Daten in Ruhe</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Zugriffskontrolle</h4>
                <p className="text-sm text-swiss-gray">Multi-Faktor-Authentifizierung</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Überwachung</h4>
                <p className="text-sm text-swiss-gray">24/7 Security Monitoring</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-lopez-green" />
                1. Datenerhebung und -verwendung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personenbezogene Daten</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• Name und E-Mail-Adresse (bei Registrierung)</li>
                  <li>• Profilbild (optional, bei Replit-Login)</li>
                  <li>• Chat-Nachrichten (zur Bereitstellung des KI-Service)</li>
                  <li>• Zahlungsinformationen (verschlüsselt über PostFinance)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technische Daten</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• IP-Adresse (anonymisiert nach 24h)</li>
                  <li>• Browser-Informationen (für Kompatibilität)</li>
                  <li>• Nutzungsstatistiken (aggregiert und anonymisiert)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Purpose of Processing */}
          <Card>
            <CardHeader>
              <CardTitle>2. Zweck der Datenverarbeitung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Service-Bereitstellung</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• KI-Chat-Funktionalität</li>
                    <li>• Nutzerkonten-Management</li>
                    <li>• Abonnement-Verwaltung</li>
                    <li>• Technischer Support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rechtliche Grundlagen</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• Vertragserfüllung (Art. 6 Abs. 1 lit. b GDPR)</li>
                    <li>• Berechtigte Interessen (Art. 6 Abs. 1 lit. f GDPR)</li>
                    <li>• Einwilligung (Art. 6 Abs. 1 lit. a GDPR)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-lopez-green" />
                3. Datenweitergabe und Drittanbieter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Externe Dienste</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm">Google Gemini AI</h5>
                    <p className="text-sm text-swiss-gray">Chat-Nachrichten zur KI-Verarbeitung (anonymisiert)</p>
                    <Badge variant="outline" className="mt-1">EU-Standard-Vertragsklauseln</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm">PostFinance</h5>
                    <p className="text-sm text-swiss-gray">Zahlungsverarbeitung (verschlüsselt)</p>
                    <Badge variant="outline" className="mt-1">Schweizer Bank</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm">Replit Authentication</h5>
                    <p className="text-sm text-swiss-gray">Benutzer-Authentifizierung</p>
                    <Badge variant="outline" className="mt-1">GDPR konform</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-lopez-green" />
                4. Ihre Rechte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Grundrechte</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• Auskunftsrecht (Art. 15 GDPR)</li>
                    <li>• Berichtigungsrecht (Art. 16 GDPR)</li>
                    <li>• Löschungsrecht (Art. 17 GDPR)</li>
                    <li>• Einschränkung der Verarbeitung (Art. 18 GDPR)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Weitere Rechte</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• Datenübertragbarkeit (Art. 20 GDPR)</li>
                    <li>• Widerspruchsrecht (Art. 21 GDPR)</li>
                    <li>• Beschwerde bei Aufsichtsbehörde</li>
                    <li>• Widerruf der Einwilligung</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>5. Kontakt und Datenschutzbeauftragter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Verantwortliche Stelle</h4>
                  <p className="text-sm text-swiss-gray">
                    wensday GmbH<br />
                    Bahnhofstrasse 1<br />
                    8001 Zürich<br />
                    Schweiz
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Datenschutz-Anfragen</h4>
                  <p className="text-sm text-swiss-gray">
                    E-Mail: privacy@wensday.ch<br />
                    Telefon: +41 44 XXX XX XX<br />
                    Response-Zeit: 30 Tage
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-12 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-swiss-gray">
            Letzte Aktualisierung: 14. August 2025<br />
            Diese Datenschutzerklärung kann bei Änderungen unserer Services aktualisiert werden.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}