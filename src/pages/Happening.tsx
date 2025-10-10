import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Sparkles, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const mockProjects = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    title: "AI-Powered Design Tool",
    description: "Building an AI tool to automate design workflows. Looking for a backend developer and UX researcher to join!",
    tags: ["AI", "Design", "React"],
    likes: 24,
    comments: 8,
    interests: 12,
  },
  {
    id: 2,
    author: "Marcus Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    title: "Sustainable Fashion Marketplace",
    description: "Creating a platform for eco-friendly fashion brands. Need help with marketplace features and payment integration.",
    tags: ["E-commerce", "Sustainability", "Node.js"],
    likes: 42,
    comments: 15,
    interests: 23,
  },
];

export default function Happening() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleInteraction = (action: string) => {
    toast.success(`${action} action (Backend needed to persist)`);
  };

  const startChat = async (authorName: string) => {
    if (!user) {
      toast.error("Please sign in to start a chat");
      navigate("/auth");
      return;
    }

    // In a real app, you'd look up the user by name and create a conversation
    toast.success(`Chat feature - would start conversation with ${authorName}`);
    navigate("/messages");
  };

  return (
    <ProtectedRoute>
      <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Happening Now
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover projects and collaborate with creators
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/create-post")}>
            <Plus className="w-4 h-4" />
            Post Project
          </Button>
        </div>

        <div className="space-y-4">
          {mockProjects.map((project) => (
            <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={project.avatar} />
                  <AvatarFallback>{project.author[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">by {project.author}</p>
                  </div>
                  
                  <p className="text-foreground">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-6 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleInteraction("Like")}
                    >
                      <Heart className="w-4 h-4" />
                      {project.likes}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleInteraction("Comment")}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {project.comments}
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2 ml-auto"
                      onClick={() => handleInteraction("Show Interest")}
                    >
                      <Sparkles className="w-4 h-4" />
                      Show Interest ({project.interests})
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => startChat(project.author)}
                    >
                      <Send className="w-4 h-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}
