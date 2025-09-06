import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu, User, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 bg-lopez-green rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              wensday.ch
              <span className="ml-2 text-xs text-swiss-gray font-normal">
                Powered by lopez.codes
              </span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          <Link href="/chat" className="text-swiss-gray hover:text-lopez-green transition-colors">
            Chat
          </Link>
          <Link href="/ecosystem" className="text-swiss-gray hover:text-lopez-green transition-colors">
            AI-Ökosystem
          </Link>
          <Link href="/crowdfunding" className="text-swiss-gray hover:text-lopez-green transition-colors">
            Crowdfunding
          </Link>
          <Link href="/firebase-overview" className="text-swiss-gray hover:text-lopez-green transition-colors">
            Firebase
          </Link>
        </nav>

        {/* User Menu & Login */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
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
                    <div className="w-6 h-6 rounded-full bg-lopez-green text-white flex items-center justify-center text-xs font-bold">
                      {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(user as any)?.isAdmin && (
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              className="bg-lopez-green text-white hover:bg-lopez-green-dark"
              onClick={() => window.location.href = '/api/login'}
            >
              Anmelden
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-6">
              <Link href="/chat" className="text-swiss-gray hover:text-lopez-green transition-colors">
                Chat
              </Link>
              <Link href="/ecosystem" className="text-swiss-gray hover:text-lopez-green transition-colors">
                AI-Ökosystem
              </Link>
              <Link href="/crowdfunding" className="text-swiss-gray hover:text-lopez-green transition-colors">
                Crowdfunding
              </Link>
              <Link href="/firebase-overview" className="text-swiss-gray hover:text-lopez-green transition-colors">
                Firebase
              </Link>
              
              <div className="border-t pt-4">
                {!isAuthenticated ? (
                  <Button 
                    className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Anmelden
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Link href="/settings" className="block text-swiss-gray hover:text-lopez-green transition-colors">
                      Einstellungen
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = '/api/logout'}
                    >
                      Abmelden
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}