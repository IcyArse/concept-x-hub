import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Settings, MessageSquare } from "lucide-react";
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

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleUploadPhoto = () => {
    toast.info("Photo upload feature coming soon");
  };

  const startChat = async () => {
    if (!user || !profile) return;

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
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: profile.id }
      ]);

    if (participantsError) {
      toast.error("Failed to add participants");
      return;
    }

    toast.success("Chat started!");
    navigate("/messages");
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
                      <Button onClick={startChat} size="sm" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Posts</h2>
            <p className="text-muted-foreground text-center py-8">
              No posts yet
            </p>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
