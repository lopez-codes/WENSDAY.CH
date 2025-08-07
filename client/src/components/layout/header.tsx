import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

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
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-swiss-gray hover:text-lopez-green transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-swiss-gray hover:text-lopez-green transition-colors"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('partners')}
                  className="text-swiss-gray hover:text-lopez-green transition-colors"
                >
                  Partners
                </button>
              </>
            )}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                    <span>{user?.firstName || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/subscribe">Subscription</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-lopez-green text-white hover:bg-lopez-green-dark"
                onClick={() => window.location.href = '/api/login'}
              >
                Start Chat
              </Button>
            )}
          </nav>

          <Button variant="ghost" className="md:hidden p-2">
            <Menu className="w-6 h-6 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
