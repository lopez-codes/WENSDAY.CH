import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, User, X, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lopez-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">wensday.ch</span>
            <span className="text-xs text-swiss-gray bg-gray-100 px-2 py-1 rounded-full">
              Powered by lopez.codes
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {!isAuthenticated && (
              <>
                <Link href="/ecosystem" className="text-swiss-gray hover:text-lopez-green transition-colors">
                  AI-Ökosystem
                </Link>
                <Link href="/styles-overview" className="text-swiss-gray hover:text-lopez-green transition-colors">
                  Styles
                </Link>
                <Link href="/crowdfunding" className="text-swiss-gray hover:text-lopez-green transition-colors">
                  Crowdfunding
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <Link href="/ecosystem" className="text-swiss-gray hover:text-lopez-green transition-colors font-medium">
                  AI-Ökosystem
                </Link>
                <Link href="/styles-overview" className="text-swiss-gray hover:text-lopez-green transition-colors font-medium">
                  Styles
                </Link>
                <Link href="/crowdfunding" className="text-swiss-gray hover:text-lopez-green transition-colors font-medium">
                  Crowdfunding
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      {(user as any)?.profileImageUrl ? (
                        <img 
                          src={(user as any).profileImageUrl} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                      <span>{(user as any)?.firstName || (user as any)?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscribe">Subscription</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                className="bg-lopez-green text-white hover:bg-lopez-green-dark"
                onClick={() => window.location.href = '/api/login'}
              >
                Start Chat
              </Button>
            )}
          </nav>

          <Button 
            variant="ghost" 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-4">
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="block w-full text-left py-2 text-swiss-gray hover:text-lopez-green transition-colors"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    className="block w-full text-left py-2 text-swiss-gray hover:text-lopez-green transition-colors"
                  >
                    Pricing
                  </button>
                  <button 
                    onClick={() => scrollToSection('partners')}
                    className="block w-full text-left py-2 text-swiss-gray hover:text-lopez-green transition-colors"
                  >
                    Partners
                  </button>
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      className="w-full bg-lopez-green text-white hover:bg-lopez-green-dark"
                      onClick={() => window.location.href = '/api/login'}
                    >
                      Start Chat
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-lopez-green rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{(user as any)?.firstName || (user as any)?.email}</p>
                      <p className="text-sm text-swiss-gray">{(user as any)?.email}</p>
                    </div>
                  </div>
                  <Link 
                    href="/settings" 
                    className="flex items-center space-x-3 py-2 text-swiss-gray hover:text-lopez-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <Link 
                    href="/subscribe" 
                    className="block py-2 text-swiss-gray hover:text-lopez-green transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button 
                    onClick={() => window.location.href = '/api/logout'}
                    className="block w-full text-left py-2 text-swiss-gray hover:text-lopez-green transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
