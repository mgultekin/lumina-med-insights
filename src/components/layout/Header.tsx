import { Button } from "@/components/ui/button";
import { LogOut, User, Plus, BarChart3, FileText, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import luminaLogo from "@/assets/lumina-logo.png";

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
            <Link to="/" className="flex items-center space-x-3">
              <img src={luminaLogo} alt="Lumina" className="h-8 w-8" />
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-medical-primary">Lumina</h1>
                <p className="text-xs text-muted-foreground">Medical AI Platform</p>
              </div>
            </Link>
            
            {/* Navigation - Show demo cases for all users, other nav only when authenticated */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/demo-cases">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Demo Cases</span>
                </Button>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analysis</span>
                    </Button>
                  </Link>
                  <Link to="/new-analysis">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>New Analysis</span>
                    </Button>
                  </Link>
                  <Link to="/templates">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Compose Article</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>History</span>
                  </Button>
                </>
              )}
            </nav>
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
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="secondary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};