import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, UserPlus, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Post {
  id: string;
  title: string;
  description: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setSearching(true);
    try {
      // Search users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Search posts by title, description, or tags
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Failed to search");
    } finally {
      setSearching(false);
    }
  };

  const addCollaborator = async (collaboratorId: string, username: string) => {
    if (!user) {
      toast.error("Please sign in");
      return;
    }

    try {
      const { error } = await supabase
        .from('collaborators')
        .insert({
          user_id: user.id,
          collaborator_id: collaboratorId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Already sent a request to this user");
        } else {
          throw error;
        }
      } else {
        toast.success(`Sent collaborator request to ${username}`);
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error("Failed to send request");
    }
  };

  const startChat = async (userId: string, username: string) => {
    if (!user) {
      toast.error("Please sign in");
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
          { conversation_id: conversation.id, user_id: userId }
        ]);

      if (participantsError) throw participantsError;

      toast.success(`Started conversation with ${username}`);
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
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SearchIcon className="w-8 h-8 text-primary" />
              Search
            </h1>
            <p className="text-muted-foreground mt-1">
              Find users and posts
            </p>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for users or posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList>
              <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4 mt-4">
              {searching ? (
                <p className="text-muted-foreground text-center">Searching...</p>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No users found" : "Start typing to search"}
                </p>
              ) : (
                users.map((profile) => (
                  <Card key={profile.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} />
                        <AvatarFallback>{profile.username[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{profile.username}</h3>
                        {profile.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => addCollaborator(profile.id, profile.username)}
                          disabled={profile.id === user?.id}
                        >
                          <UserPlus className="w-4 h-4" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => startChat(profile.id, profile.username)}
                          disabled={profile.id === user?.id}
                        >
                          <Send className="w-4 h-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4 mt-4">
              {searching ? (
                <p className="text-muted-foreground text-center">Searching...</p>
              ) : posts.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No posts found" : "Start typing to search"}
                </p>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`} />
                        <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">by {post.profiles.username}</p>
                        </div>
                        
                        <p className="text-foreground">{post.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
