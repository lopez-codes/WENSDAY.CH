import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PricingCards from "@/components/pricing/pricing-cards";
import ChatInterface from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { Shield, Layers, TrendingUp, Users, Bot, Zap } from "lucide-react";
// Removed react-icons to fix import issues

export default function Landing() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-swiss-light">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-swiss-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Swiss AI Chat
                  <span className="text-lopez-green"> Multiverse</span>
                </h1>
                <p className="text-xl text-swiss-gray leading-relaxed">
                  Professional, independent AI research and chat platform built for Swiss precision. 
                  Access multiple AI models in one unified interface.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-lopez-green text-white px-8 py-4 text-lg font-semibold hover:bg-lopez-green-dark transition-all transform hover:scale-105"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start Free Chat
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-lopez-green text-lopez-green px-8 py-4 text-lg font-semibold hover:bg-lopez-green hover:text-white transition-all"
                  onClick={() => scrollToSection('pricing')}
                >
                  View Pricing
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-lopez-green" />
                  <span className="text-sm text-swiss-gray">Swiss Data Protection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-lopez-green" />
                  <span className="text-sm text-swiss-gray">Real-time AI</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <ChatInterface isDemo={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Swiss AI Innovation
            </h2>
            <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
              Independent research platform combining multiple AI models with Swiss precision and data protection standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-swiss-light p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-lopez-green rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Swiss Data Protection</h3>
              <p className="text-swiss-gray leading-relaxed">
                Your conversations are hosted in Switzerland with the highest data protection standards and complete privacy.
              </p>
            </div>

            <div className="bg-swiss-light p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-lopez-green rounded-xl flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Multiverse</h3>
              <p className="text-swiss-gray leading-relaxed">
                Access multiple AI models including Google Gemini in one unified interface for comprehensive research.
              </p>
            </div>

            <div className="bg-swiss-light p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-lopez-green rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Research</h3>
              <p className="text-swiss-gray leading-relaxed">
                Independent AI research platform designed for professionals requiring accurate, unbiased information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-swiss-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
              Flexible pricing for individuals and professionals. All plans include Swiss data hosting.
            </p>
          </div>
          <PricingCards />
          <div className="text-center mt-12">
            <p className="text-swiss-gray">
              All payments processed securely through Stripe. Swiss VAT included.
            </p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted Partners
            </h2>
            <p className="text-xl text-swiss-gray max-w-3xl mx-auto">
              Built with cutting-edge technology from industry leaders and powered by lopez.codes innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all mb-4">
                <div className="w-16 h-16 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">M</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Microsoft</h3>
              <p className="text-sm text-swiss-gray">Azure Infrastructure</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all mb-4">
                <div className="w-16 h-16 mx-auto bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">G</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Google</h3>
              <p className="text-sm text-swiss-gray">Gemini AI Models</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all mb-4">
                <div className="w-16 h-16 mx-auto bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">R</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Replit</h3>
              <p className="text-sm text-swiss-gray">Development Platform</p>
            </div>

            <div className="text-center">
              <div className="bg-lopez-green rounded-2xl p-8 hover:shadow-lg transition-all mb-4">
                <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">lopez.codes</h3>
              <p className="text-sm text-swiss-gray">Core Technology</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-3 bg-swiss-light px-6 py-4 rounded-2xl">
              <div className="w-8 h-8 bg-lopez-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-swiss-gray font-medium">Powered by lopez.codes</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
