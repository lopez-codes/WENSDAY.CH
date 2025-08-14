import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Scale, AlertTriangle, CreditCard, Users, Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
            Nutzungsbedingungen für wensday.ch Dienste
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-lopez-green text-white">Schweizer Recht</Badge>
            <Badge className="bg-lopez-green text-white">Gültig ab 14.08.2025</Badge>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-lopez-green" />
              Rechtliche Grundlagen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-swiss-gray mb-4">
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Webseite wensday.ch 
              und der damit verbundenen Dienste der wensday GmbH mit Sitz in Zürich, Schweiz.
            </p>
            <p className="text-swiss-gray">
              Durch die Nutzung unserer Dienste stimmen Sie diesen Bedingungen zu. 
              Es gilt Schweizer Recht unter Ausschluss des UN-Kaufrechts.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-lopez-green" />
                1. Unternehmensinformationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Anbieter</h4>
                  <p className="text-sm text-swiss-gray">
                    wensday GmbH<br />
                    Bahnhofstrasse 1<br />
                    8001 Zürich<br />
                    Schweiz
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registrierung</h4>
                  <p className="text-sm text-swiss-gray">
                    Handelsregister: CHE-XXX.XXX.XXX<br />
                    UID: CHE-XXX.XXX.XXX MWST<br />
                    E-Mail: legal@wensday.ch<br />
                    Telefon: +41 44 XXX XX XX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>2. Leistungsbeschreibung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">KI-Chat-Service</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• Bereitstellung von KI-gestützten Chatdiensten</li>
                  <li>• Verschiedene Abonnement-Modelle (Free, Ultra, Pro)</li>
                  <li>• Nachrichten-Kontingente je nach gewähltem Plan</li>
                  <li>• Technischer Support und Dokumentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Crowdfunding-Plattform</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• Investitionsmöglichkeiten in wensday GmbH</li>
                  <li>• Verschiedene Investor-Kategorien</li>
                  <li>• ID-Verifizierung für größere Investitionen</li>
                  <li>• Investor-Dashboard und Updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-lopez-green" />
                3. Nutzerpflichten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Erlaubte Nutzung</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• Persönliche oder geschäftliche Nutzung im Rahmen des gewählten Plans</li>
                  <li>• Einhaltung der Nachrichten-Limits</li>
                  <li>• Wahrheitsgemäße Angaben bei der Registrierung</li>
                  <li>• Schutz der Zugangsdaten</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Verbotene Aktivitäten</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• Weitergabe von Zugangsdaten an Dritte</li>
                  <li>• Reverse Engineering oder Dekompilierung</li>
                  <li>• Generierung illegaler, schädlicher oder diskriminierender Inhalte</li>
                  <li>• Überlastung der Systeme durch automatisierte Anfragen</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-lopez-green" />
                4. Zahlungsbedingungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Abonnements</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• Free: CHF 0/Monat (10 Nachrichten/Tag)</li>
                    <li>• Ultra: CHF 19/Monat (500 Nachrichten/Tag)</li>
                    <li>• Pro: CHF 49/Monat (Unlimited)</li>
                    <li>• Alle Preise inkl. MwSt.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Crowdfunding</h4>
                  <ul className="text-sm text-swiss-gray space-y-1">
                    <li>• Mindestinvestition: CHF 1'000</li>
                    <li>• Transaktionsgebühr: 2.5%</li>
                    <li>• ID-Verifizierung: CHF 25</li>
                    <li>• Zahlungsabwicklung über PostFinance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-lopez-green" />
                5. Haftung und Gewährleistung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Verfügbarkeit</h4>
                <p className="text-sm text-swiss-gray">
                  Wir streben eine Verfügbarkeit von 99.5% an, können jedoch keine absolute Garantie geben. 
                  Geplante Wartungsarbeiten werden rechtzeitig angekündigt.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">KI-Antworten</h4>
                <p className="text-sm text-swiss-gray">
                  KI-generierte Inhalte dienen nur zu Informationszwecken. wensday GmbH übernimmt keine 
                  Verantwortung für die Richtigkeit, Vollständigkeit oder Angemessenheit der Antworten.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Haftungsbeschränkung</h4>
                <p className="text-sm text-swiss-gray">
                  Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Bei leichter Fahrlässigkeit 
                  haften wir nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf vorhersehbare Schäden.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-lopez-green" />
                6. Vertragslaufzeit und Kündigung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Abonnements</h4>
                <ul className="text-sm text-swiss-gray space-y-1 ml-4">
                  <li>• Monatliche Abrechnung, jederzeit kündbar</li>
                  <li>• Kündigung zum Ende des aktuellen Abrechnungszeitraums</li>
                  <li>• Keine Rückerstattung bei vorzeitiger Kündigung</li>
                  <li>• Automatische Verlängerung bei Nichtkündigung</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Sperrung bei Missbrauch</h4>
                <p className="text-sm text-swiss-gray">
                  Bei Verstößen gegen diese AGB behalten wir uns vor, Accounts zu sperren oder zu kündigen. 
                  In schwerwiegenden Fällen erfolgt die Sperrung ohne Vorankündigung.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes and Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>7. Änderungen und Gerichtsstand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">AGB-Änderungen</h4>
                <p className="text-sm text-swiss-gray">
                  Änderungen dieser AGB werden 30 Tage im Voraus per E-Mail angekündigt. 
                  Widersprechen Sie nicht innerhalb von 30 Tagen, gelten die Änderungen als akzeptiert.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Anwendbares Recht</h4>
                <p className="text-sm text-swiss-gray">
                  Es gilt ausschließlich Schweizer Recht unter Ausschluss des UN-Kaufrechts. 
                  Gerichtsstand ist Zürich, Schweiz.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Salvatorische Klausel</h4>
                <p className="text-sm text-swiss-gray">
                  Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit 
                  der übrigen Bestimmungen unberührt.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-12 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-swiss-gray">
            Letzte Aktualisierung: 14. August 2025<br />
            Version 1.0 - Diese AGB treten mit der Registrierung der wensday GmbH in Kraft.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}