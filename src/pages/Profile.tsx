import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Settings, MessageSquare, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Collaborator {
  id: string;
  status: string;
  collaborator_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);

  useEffect(() => {
    if (user) {
      const profileUserId = userId || user.id;
      setIsOwnProfile(profileUserId === user.id);
      loadProfile(profileUserId);
      loadPosts(profileUserId);
      loadCollaborators(profileUserId);
    }
  }, [user, userId]);

  const loadProfile = async (profileUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileUserId)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const loadPosts = async (profileUserId: string) => {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error("Failed to load posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadCollaborators = async (profileUserId: string) => {
    setLoadingCollaborators(true);
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select(`
          *,
          profiles!collaborators_collaborator_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', profileUserId)
        .eq('status', 'accepted');

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      toast.error("Failed to load collaborators");
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleUploadPhoto = () => {
    toast.info("Photo upload feature coming soon");
  };

  const startChat = async () => {
    if (!user || !profile || profile.id === user.id) return;

    try {
      // Create a new conversation
      const { data: conversation, error: convoError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convoError || !conversation) {
        toast.error("Failed to create conversation");
        return;
      }

      // Add both participants
      // Add current user as participant first
      const { error: selfError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, user_id: user.id });

      if (selfError) {
        toast.error("Failed to add you to the conversation");
        return;
      }

      // Then add the other participant
      const { error: otherError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, user_id: profile.id });

      if (otherError) {
        toast.error("Failed to add the other participant");
        return;
      }

      toast.success("Chat started!");
      navigate("/messages");
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start conversation");
    }
  };

  const sendCollaboratorRequest = async () => {
    if (!user || !profile || profile.id === user.id) return;
    try {
      // Check if a relationship already exists (pending or accepted)
      const { data: existing, error: checkError } = await supabase
        .from('collaborators')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},collaborator_id.eq.${profile.id}),and(user_id.eq.${profile.id},collaborator_id.eq.${user.id}))`);

      if (checkError) throw checkError;
      if (existing && existing.length > 0) {
        toast.info("Collaborator request already exists");
        return;
      }

      const { error } = await supabase.from('collaborators').insert({
        user_id: user.id,
        collaborator_id: profile.id,
        status: 'pending'
      });

      if (error) throw error;
      toast.success('Collaborator request sent');
    } catch (err) {
      console.error('Error sending collaborator request:', err);
      toast.error('Failed to send collaborator request');
    }
  };

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">Loading profile...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={handleUploadPhoto}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                    <p className="text-muted-foreground mt-1">
                      {profile.bio || "No bio yet"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={startChat} size="sm" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </Button>
                        <Button onClick={sendCollaboratorRequest} variant="secondary" size="sm" className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          Add Collaborator
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Posts</h2>
            {loadingPosts ? (
              <p className="text-muted-foreground text-center py-8">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No posts yet</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="p-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/post/${post.id}`)}>
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-3">{post.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{post.likes_count} likes</span>
                      <span>{post.comments_count} comments</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Collaborators section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Collaborators</h2>
            {loadingCollaborators ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : collaborators.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No collaborators yet</p>
            ) : (
              <div className="space-y-3">
                {collaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={collab.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${collab.profiles.username}`} />
                      <AvatarFallback>{collab.profiles.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{collab.profiles.username}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
