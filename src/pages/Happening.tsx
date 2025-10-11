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
import { useEffect, useState } from "react";

interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  interests_count: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Happening() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInteraction = (action: string) => {
    toast.success(`${action} action (Backend needed to persist)`);
  };

  const startChat = async (authorName: string, authorId: string) => {
    if (!user) {
      toast.error("Please sign in to start a chat");
      navigate("/auth");
      return;
    }

    try {
      // Create a new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add both participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: authorId }
        ]);

      if (participantsError) throw participantsError;

      toast.success(`Started conversation with ${authorName}`);
      navigate("/messages");
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error("Failed to start conversation");
    }
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
          {loading ? (
            <p className="text-muted-foreground text-center">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-center">No posts yet. Be the first to share!</p>
          ) : (
            posts.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={project.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.profiles.username}`} />
                    <AvatarFallback>{project.profiles.username[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">by {project.profiles.username}</p>
                    </div>
                    
                    <p className="text-foreground">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
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
                        {project.likes_count}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleInteraction("Comment")}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {project.comments_count}
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-2 ml-auto"
                        onClick={() => handleInteraction("Show Interest")}
                      >
                        <Sparkles className="w-4 h-4" />
                        Show Interest ({project.interests_count})
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => startChat(project.profiles.username, project.user_id)}
                      >
                        <Send className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}
