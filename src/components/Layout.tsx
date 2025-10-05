import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
