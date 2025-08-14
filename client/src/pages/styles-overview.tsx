import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";
import { Palette, Code, Layers, Globe, Crown, Sparkles } from "lucide-react";

export default function StylesOverview() {
  const components = [
    {
      name: "3D AI-Ökosystem Cube",
      description: "Interaktiver 3D-Würfel zur Darstellung aller AI-Provider",
      path: "/ecosystem",
      features: ["Automatische Rotation", "6 AI-Provider-Seiten", "Hover-Effekte", "Klickbare Details"],
      status: "Aktiv"
    },
    {
      name: "Business Dashboard",
      description: "Geschäftsfokussierte Übersichtsseite mit Metriken",
      path: "/",
      features: ["Quality Control Metrics", "Business Analytics", "Swiss Design", "Performance Tracking"],
      status: "Aktiv"
    },
    {
      name: "Chat Interface",
      description: "Erweiterte Chat-Funktionen mit Qualitätskontrolle",
      path: "/",
      features: ["AI Quality Detection", "Error Handling", "Message History", "Business Categories"],
      status: "Aktiv"
    },
    {
      name: "Swiss Design System",
      description: "Lopez-Green Farbschema mit Swiss-Branding",
      path: "/",
      features: ["Lopez Green Primary", "Swiss Gray", "Typography", "Consistent Spacing"],
      status: "Global"
    }
  ];

  const styles = [
    {
      name: "Lopez Green",
      value: "hsl(129.4118 100% 27.0588%)",
      usage: "Primary Brand Color"
    },
    {
      name: "Swiss Blue", 
      value: "hsl(218.18 75.86% 31.96%)",
      usage: "Accent Color"
    },
    {
      name: "Swiss Gray",
      value: "hsl(214.55 13.95% 40.78%)",
      usage: "Text & Borders"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-lopez-green">wensday.ch</span> Design System
          </h1>
          <p className="text-xl text-swiss-gray mb-6">
            Übersicht aller erstellten Komponenten und Styles
          </p>
          <Badge variant="outline" className="text-sm">
            <Palette className="w-4 h-4 mr-1" />
            Swiss Business Design
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Components Overview */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Layers className="w-6 h-6 text-lopez-green" />
              Komponenten
            </h2>
            <div className="space-y-4">
              {components.map((component, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <Badge 
                        variant={component.status === "Aktiv" ? "default" : "secondary"}
                        className={component.status === "Aktiv" ? "bg-lopez-green" : ""}
                      >
                        {component.status}
                      </Badge>
                    </div>
                    <CardDescription>{component.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {component.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={component.path}>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Ansehen
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Palette className="w-6 h-6 text-lopez-green" />
              Farbpalette
            </h2>
            <div className="space-y-4">
              {styles.map((style, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: style.value }}
                      ></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{style.name}</h3>
                        <p className="text-sm text-swiss-gray font-mono">{style.value}</p>
                        <p className="text-sm text-swiss-gray mt-1">{style.usage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-6 h-6 text-lopez-green" />
              Technische Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">Frontend Stack</h3>
                <ul className="space-y-2 text-sm">
                  <li>• React 18 mit TypeScript</li>
                  <li>• shadcn/ui Komponenten</li>
                  <li>• Tailwind CSS für Styling</li>
                  <li>• Framer Motion für Animationen</li>
                  <li>• 3D CSS Transforms für Cube</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">Design Prinzipien</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Swiss Business Ästhetik</li>
                  <li>• Lopez-Green als Primary Color</li>
                  <li>• Accessibility-erste Ansatz</li>
                  <li>• Mobile-responsive Design</li>
                  <li>• Performance-optimiert</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-lopez-green" />
              Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/">
                  Home Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/ecosystem">
                  3D AI-Ökosystem
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings">
                  Einstellungen
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}