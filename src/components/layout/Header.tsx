import { Button } from "@/components/ui/button";
import { LogOut, User, Plus, BarChart3 } from "lucide-react";

interface HeaderProps {
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

export const Header = ({ isAuthenticated = false, onSignOut }: HeaderProps) => {
  return (
    <header className="w-full border-b bg-clinical-surface clinical-shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-medical-primary">Lumina</h1>
              <p className="text-sm text-muted-foreground font-medium">AI for Medical Insight</p>
            </div>
            
            {/* Navigation - Only show when authenticated */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Analysis</span>
                </Button>
              </nav>
            )}
          </div>

          {/* Account Actions */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Account</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
              <Button variant="medical" size="sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};