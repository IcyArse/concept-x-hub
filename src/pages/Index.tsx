import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Users, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/happening");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-4xl">C</span>
          </div>
          
          {/* Hero */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">Concept</span><span className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">X</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Connect with creators, share your projects, and collaborate on ideas that matter
          </p>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="text-lg px-8 shadow-lg">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-20">
            <Link to="/happening" className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow block">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover Projects</h3>
              <p className="text-muted-foreground">
                Find exciting projects and opportunities to collaborate
              </p>
            </Link>
            
            <Link to="/search" className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow block">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Build Together</h3>
              <p className="text-muted-foreground">
                Connect with talented creators and grow your network
              </p>
            </Link>
            
            <Link to="/create-post" className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow block">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Launch Ideas</h3>
              <p className="text-muted-foreground">
                Share your vision and bring concepts to life together
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
