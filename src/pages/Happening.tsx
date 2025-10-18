import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Sparkles, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  interests_count: number;
  user_liked?: boolean;
  user_interested?: boolean;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
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
  const [selectedPostComments, setSelectedPostComments] = useState<{ [key: string]: Comment[] }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

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
      
      // Fetch user interactions for each post
      if (user && data) {
        const postsWithInteractions = await Promise.all(
          data.map(async (post) => {
            const [likesRes, interestsRes] = await Promise.all([
              supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .maybeSingle(),
              supabase
                .from('post_interests')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .maybeSingle()
            ]);

            return {
              ...post,
              user_liked: !!likesRes.data,
              user_interested: !!interestsRes.data
            };
          })
        );
        setPosts(postsWithInteractions);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        toast.success("Unliked post");
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        toast.success("Liked post");
      }
      await fetchPosts();
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error("Failed to update like");
    }
  };

  const handleInterest = async (postId: string, isInterested: boolean) => {
    if (!user) return;
    
    try {
      if (isInterested) {
        await supabase
          .from('post_interests')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        toast.success("Removed interest");
      } else {
        await supabase
          .from('post_interests')
          .insert({ post_id: postId, user_id: user.id });
        toast.success("Showed interest");
      }
      await fetchPosts();
    } catch (error) {
      console.error('Error handling interest:', error);
      toast.error("Failed to update interest");
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSelectedPostComments(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Failed to load comments");
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;
    
    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment[postId].trim()
        });
      
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
      await fetchPosts();
      toast.success("Comment added");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
    }
  };

  const toggleComments = (postId: string) => {
    const isShowing = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: isShowing }));
    if (isShowing && !selectedPostComments[postId]) {
      fetchComments(postId);
    }
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
                      <h3 
                        className="font-semibold text-lg cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/post/${project.id}`)}
                      >
                        {project.title}
                      </h3>
                      <p 
                        className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/profile/${project.user_id}`)}
                      >
                        by {project.profiles.username}
                      </p>
                    </div>
                    
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none relative cursor-pointer"
                      onClick={() => navigate(`/post/${project.id}`)}
                    >
                      {project.description.length > 300 ? (
                        <>
                          <div className="relative">
                            <ReactMarkdown>{project.description.substring(0, 300)}</ReactMarkdown>
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                          </div>
                          <p className="text-sm text-primary mt-2">Click to read more...</p>
                        </>
                      ) : (
                        <ReactMarkdown>{project.description}</ReactMarkdown>
                      )}
                    </div>
                    
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
                        onClick={() => handleLike(project.id, project.user_liked || false)}
                      >
                        <Heart className={`w-4 h-4 ${project.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                        {project.likes_count}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => toggleComments(project.id)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {project.comments_count}
                      </Button>
                      
                      <Button
                        variant={project.user_interested ? "default" : "outline"}
                        size="sm"
                        className="gap-2 ml-auto"
                        onClick={() => handleInterest(project.id, project.user_interested || false)}
                      >
                        <Sparkles className="w-4 h-4" />
                        {project.user_interested ? "Interested" : "Show Interest"} ({project.interests_count})
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
                    
                    {showComments[project.id] && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedPostComments[project.id]?.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles.username}`} />
                                <AvatarFallback>{comment.profiles.username[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-muted rounded-lg p-2">
                                <p className="text-sm font-semibold">{comment.profiles.username}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {selectedPostComments[project.id]?.length > 3 && (
                            <p 
                              className="text-sm text-primary cursor-pointer hover:underline text-center"
                              onClick={() => navigate(`/post/${project.id}`)}
                            >
                              View all {selectedPostComments[project.id].length} comments
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={newComment[project.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [project.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleComment(project.id);
                              }
                            }}
                          />
                          <Button size="sm" onClick={() => handleComment(project.id)}>
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
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
