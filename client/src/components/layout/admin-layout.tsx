import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, LogOut, Settings, Shield } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Admin Branding */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    wensday.ch Admin
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Platform Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Admin User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {(user as any)?.firstName || (user as any)?.email}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin {(user as any)?.adminId || "N/A"}
                  </Badge>
                  {(user as any)?.hasCoreAccess && (
                    <Badge variant="outline" className="text-xs">
                      Core Access
                    </Badge>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/settings'}
                  data-testid="button-admin-settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-admin-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="px-6 py-6">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>
              © 2025 Lopez Codes (CHE-316.025.450) • Admin System v2.1
            </div>
            <div className="flex items-center space-x-4">
              <span>Logged as: {(user as any)?.email}</span>
              <span>•</span>
              <span>Session: Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}