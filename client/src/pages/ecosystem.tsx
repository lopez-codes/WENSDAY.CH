import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Brain, 
  Cpu, 
  Zap, 
  Shield, 
  Globe, 
  Star,
  CheckCircle,
  Crown,
  Map
} from "lucide-react";
import { motion } from "framer-motion";

export default function EcosystemPage() {
  const { user } = useAuth();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);

  // Auto-rotate the cube
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedFace) {
        setRotateY(prev => prev + 0.5);
        setRotateX(prev => prev + 0.2);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [selectedFace]);

  const ecosystemFaces = [
    {
      id: "gemini",
      name: "Gemini AI",
      icon: <Bot className="w-8 h-8" />,
      color: "from-blue-500 to-blue-700",
      description: "Google's multimodale AI für Business-Intelligence",
      features: ["Schweizer Datenverarbeitung", "Multimodale Analysen", "Enterprise-Security"],
      position: "front"
    },
    {
      id: "claude",
      name: "Claude AI",
      icon: <Brain className="w-8 h-8" />,
      color: "from-purple-500 to-purple-700",
      description: "Anthropics AI für komplexe Geschäftsprozesse",
      features: ["Ethische AI-Prinzipien", "Lange Kontexte", "Präzise Analysen"],
      position: "back"
    },
    {
      id: "copilot",
      name: "GitHub Copilot",
      icon: <Cpu className="w-8 h-8" />,
      color: "from-green-500 to-green-700",
      description: "Microsoft's Code-AI für Entwicklungsaufgaben",
      features: ["Code-Generierung", "Automatisierung", "DevOps Integration"],
      position: "right"
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      icon: <Zap className="w-8 h-8" />,
      color: "from-orange-500 to-orange-700",
      description: "OpenAI's GPT für universelle Business-Anwendungen",
      features: ["Natürliche Sprache", "Kreative Lösungen", "API-Integration"],
      position: "left"
    },
    {
      id: "quality",
      name: "Qualitätskontrolle",
      icon: <Shield className="w-8 h-8" />,
      color: "from-red-500 to-red-700",
      description: "Advanced AI Quality Control System",
      features: ["Fehlererkennnung", "Vertrauenswerte", "Faktenchecks"],
      position: "top"
    },
    {
      id: "wensday-core",
      name: "wensday-core",
      icon: <Crown className="w-8 h-8" />,
      color: "from-lopez-green to-yellow-500",
      description: "Schweizer Premium AI-Kern (3K Paket)",
      features: ["Swiss Hosting", "Pre-Release Zugang", "Prioritäts-Support"],
      position: "bottom",
      premium: true
    }
  ];

  const handleFaceClick = (faceId: string) => {
    setSelectedFace(selectedFace === faceId ? null : faceId);
  };

  const selectedFaceData = ecosystemFaces.find(face => face.id === selectedFace);

  return (
    <div className="min-h-screen bg-swiss-light">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              wensday.ch <span className="text-lopez-green">AI-Ökosystem</span>
            </h1>
            <p className="text-xl text-swiss-gray mb-6">
              Entdecken Sie alle Dimensionen unserer Business-AI-Plattform
            </p>
            <Badge variant="outline" className="text-sm">
              <Globe className="w-4 h-4 mr-1" />
              Swiss-Hosted Enterprise Solutions
            </Badge>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* 3D Cube Visualization */}
          <div className="flex flex-col items-center">
            <div className="relative w-80 h-80 mb-8" style={{ perspective: '1000px' }}>
              <div 
                className="cube-container"
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: selectedFace ? 'transform 0.8s ease' : 'none'
                }}
              >
                {ecosystemFaces.map((face, index) => (
                  <motion.div
                    key={face.id}
                    className={`cube-face cube-face-${face.position} cursor-pointer`}
                    style={{
                      background: `linear-gradient(135deg, ${face.color.split(' ')[1]}, ${face.color.split(' ')[3]})`
                    }}
                    onClick={() => handleFaceClick(face.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white relative">
                      {face.premium && (
                        <Crown className="w-6 h-6 absolute top-2 right-2 text-yellow-300" />
                      )}
                      <div className="mb-2">{face.icon}</div>
                      <h3 className="font-bold text-sm text-center">{face.name}</h3>
                      {selectedFace === face.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-black bg-opacity-20 rounded-lg"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-swiss-gray mb-4">
                Klicken Sie auf eine Seite um mehr zu erfahren
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFace(null);
                  setRotateX(0);
                  setRotateY(0);
                }}
              >
                Zurücksetzen
              </Button>
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            {selectedFaceData ? (
              <motion.div
                key={selectedFaceData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedFaceData.color}`}>
                        <div className="text-white">{selectedFaceData.icon}</div>
                      </div>
                      {selectedFaceData.name}
                      {selectedFaceData.premium && (
                        <Badge className="bg-yellow-500">Premium</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-swiss-gray">{selectedFaceData.description}</p>
                    
                    <div>
                      <h4 className="font-medium mb-2">Hauptfeatures:</h4>
                      <ul className="space-y-1">
                        {selectedFaceData.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-lopez-green" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedFaceData.premium && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          3K Premium Paket
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          Exklusiver Zugang zu wensday-core, unserer schweizer Premium-AI-Plattform mit Pre-Release Features.
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">Swiss-Hosting</Badge>
                          <Badge variant="outline" className="text-xs">Pre-Release</Badge>
                          <Badge variant="outline" className="text-xs">Priority Support</Badge>
                        </div>
                      </div>
                    )}

                    {(user as any)?.subscriptionTier !== 'pro' && selectedFaceData.premium && (
                      <Button 
                        className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                        onClick={() => window.location.href = '/subscribe'}
                      >
                        3K Paket upgraden für wensday-core Zugang
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    wensday.ch Ökosystem Übersicht
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-swiss-gray">
                    Unser Business-AI-Ökosystem bietet Ihnen Zugang zu den führenden AI-Providern mit schweizer Qualitätsstandards und Datenschutz.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-lopez-green">4</div>
                      <div className="text-xs text-swiss-gray">AI Provider</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">1</div>
                      <div className="text-xs text-swiss-gray">Quality System</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">24/7</div>
                      <div className="text-xs text-swiss-gray">Verfügbarkeit</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-500">🇨🇭</div>
                      <div className="text-xs text-swiss-gray">Swiss Hosting</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Link href="/home">
                      <Button className="w-full bg-lopez-green hover:bg-lopez-green-dark">
                        Zum Business Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .cube-container {
          width: 150px;
          height: 150px;
          position: relative;
          margin: 100px auto;
        }
        
        .cube-face {
          position: absolute;
          width: 150px;
          height: 150px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .cube-face-front { transform: rotateY(0deg) translateZ(75px); }
        .cube-face-back { transform: rotateY(180deg) translateZ(75px); }
        .cube-face-right { transform: rotateY(90deg) translateZ(75px); }
        .cube-face-left { transform: rotateY(-90deg) translateZ(75px); }
        .cube-face-top { transform: rotateX(90deg) translateZ(75px); }
        .cube-face-bottom { transform: rotateX(-90deg) translateZ(75px); }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .cube-container:hover {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}