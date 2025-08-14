import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Target, Award, MapPin, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Über Lopez Codes
          </h1>
          <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
            Schweizer KI-Innovation für ethische und nachhaltige Technologie-Lösungen
          </p>
          <div className="mt-4 text-sm text-swiss-gray">
            <p>CHE-316.025.450 • Einzelunternehmen • Eingetragen im Handelsregister Bern</p>
          </div>
        </div>

        {/* Company Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-6 h-6 text-lopez-green" />
              Unternehmensphilosophie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-swiss-gray">
              Lopez Codes ist ein im Handelsregister eingetragenes Schweizer Einzelunternehmen, das sich auf 
              Forschung und Entwicklung im Bereich der künstlichen Intelligenz (KI), des maschinellen Lernens 
              und der Computer Vision spezialisiert hat.
            </p>
            <p className="text-swiss-gray">
              Unser Fokus liegt auf der Bereitstellung von Lösungen im Bereich des Cloud Computing, der 
              Webentwicklung sowie der Integration und Modernisierung von IT-Systemen. Wir bieten zudem 
              Beratungs- und Schulungsdienstleistungen in diesen Bereichen an.
            </p>
            <p className="text-swiss-gray">
              Mit Sitz in Münsingen, Kanton Bern, profitieren wir von strengen Schweizer Datenschutzgesetzen 
              und einer stabilen Rechtsordnung, die unseren Kunden höchste Sicherheit garantiert.
            </p>
          </CardContent>
        </Card>

        {/* Key Facts */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lopez-green" />
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-swiss-gray">Münsingen, Bern</p>
              <p className="text-sm text-swiss-gray">Tägertschistrasse 5, 3110 Münsingen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-lopez-green" />
                Märkte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-swiss-gray">DACH-Region</p>
              <p className="text-sm text-swiss-gray">Deutschland, Österreich, Schweiz</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-lopez-green" />
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-swiss-gray">GDPR & Swiss DSG</p>
              <p className="text-sm text-swiss-gray">UID: CHE-316.025.450</p>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-lopez-green" />
                Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-swiss-gray">
                Ethische KI-Technologie für Schweizer Unternehmen entwickeln, die Datenschutz, 
                Transparenz und nachhaltige Innovation in den Mittelpunkt stellt.
              </p>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">Ethische KI</Badge>
                <Badge variant="outline">Swiss Privacy</Badge>
                <Badge variant="outline">Nachhaltigkeit</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-lopez-green" />
                Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-swiss-gray">
                Führende Schweizer KI-Plattform werden, die internationalen Standards für 
                Datenschutz und ethische Technologie setzt.
              </p>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">Swiss Leadership</Badge>
                <Badge variant="outline">Global Standards</Badge>
                <Badge variant="outline">Innovation</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funding Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Series A Finanzierung</CardTitle>
            <CardDescription>
              30 Millionen CHF für Unternehmensgründung und Team-Aufbau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Finanzierungsziele</h4>
                <ul className="text-sm text-swiss-gray space-y-1">
                  <li>• Team-Aufbau: CHF 12M</li>
                  <li>• Infrastruktur: CHF 8M</li>
                  <li>• Forschung & Entwicklung: CHF 6M</li>
                  <li>• Marktexpansion: CHF 4M</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Investor-Kategorien</h4>
                <ul className="text-sm text-swiss-gray space-y-1">
                  <li>• Community: CHF 1K-5K</li>
                  <li>• Business: CHF 5K-25K</li>
                  <li>• Strategic: CHF 25K-100K</li>
                  <li>• Institutional: CHF 100K+</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Geschäftsadresse</h4>
                <p className="text-sm text-swiss-gray">
                  Lopez Codes<br />
                  Tägertschistrasse 5<br />
                  3110 Münsingen<br />
                  Schweiz
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Kontakt</h4>
                <p className="text-sm text-swiss-gray">
                  E-Mail: alpha@lopez.codes<br />
                  Web: https://lopez.codes<br />
                  UID: CHE-316.025.450
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}