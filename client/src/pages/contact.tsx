import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, MessageSquare, Users, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Nachricht gesendet",
        description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
      });
      setFormData({ name: '', email: '', company: '', subject: '', category: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kontakt & Support
          </h1>
          <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
            Haben Sie Fragen zu unseren KI-Lösungen? Wir helfen Ihnen gerne weiter.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-lopez-green" />
                  Nachricht senden
                </CardTitle>
                <CardDescription>
                  Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Unternehmen</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Allgemeine Anfrage</SelectItem>
                        <SelectItem value="investment">Investment / Crowdfunding</SelectItem>
                        <SelectItem value="technical">Technischer Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="media">Medien / Presse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Wird gesendet..." : "Nachricht senden"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-6 h-6 text-lopez-green" />
                  Kontaktdaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-lopez-green mt-1" />
                  <div>
                    <h4 className="font-semibold">Geschäftsadresse</h4>
                    <p className="text-sm text-swiss-gray">
                      Lopez Codes<br />
                      Tägertschistrasse 5<br />
                      3110 Münsingen<br />
                      Schweiz<br />
                      <span className="text-xs font-mono">UID: CHE-316.025.450</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-lopez-green mt-1" />
                  <div>
                    <h4 className="font-semibold">E-Mail</h4>
                    <p className="text-sm text-swiss-gray">alpha@lopez.codes</p>
                    <p className="text-sm text-swiss-gray">contact@lopez.codes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-lopez-green mt-1" />
                  <div>
                    <h4 className="font-semibold">Telefon</h4>
                    <p className="text-sm text-swiss-gray">+41 44 XXX XX XX</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-lopez-green mt-1" />
                  <div>
                    <h4 className="font-semibold">Geschäftszeiten</h4>
                    <p className="text-sm text-swiss-gray">
                      Montag - Freitag: 09:00 - 18:00<br />
                      Wochenende: Geschlossen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-lopez-green" />
                  Support-Bereiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Technischer Support</span>
                    <Badge variant="outline">24h Response</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Investment Anfragen</span>
                    <Badge variant="outline">Same Day</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Partnership</span>
                    <Badge variant="outline">48h Response</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medien / Presse</span>
                    <Badge variant="outline">Priority</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card>
              <CardHeader>
                <CardTitle>Häufige Fragen</CardTitle>
                <CardDescription>
                  Viele Antworten finden Sie in unserem FAQ-Bereich
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  FAQ besuchen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}