import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

export const Layout = ({ children, isAuthenticated = false, onSignOut }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} onSignOut={onSignOut} />
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
};