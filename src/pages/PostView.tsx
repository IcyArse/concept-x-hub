import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Sparkles, Send, ArrowLeft } from "lucide-react";
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

export default function PostView() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
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
        .eq('id', postId)
        .single();

      if (error) throw error;
      
      if (user && data) {
        const [likesRes, interestsRes] = await Promise.all([
          supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('post_interests')
            .select('id')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        setPost({
          ...data,
          user_liked: !!likesRes.data,
          user_interested: !!interestsRes.data
        });
      } else {
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
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
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error("Failed to load comments");
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;
    
    try {
      if (post.user_liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        toast.success("Unliked post");
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
        toast.success("Liked post");
      }
      await fetchPost();
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error("Failed to update like");
    }
  };

  const handleInterest = async () => {
    if (!user || !post) return;
    
    try {
      if (post.user_interested) {
        await supabase
          .from('post_interests')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        toast.success("Removed interest");
      } else {
        await supabase
          .from('post_interests')
          .insert({ post_id: post.id, user_id: user.id });
        toast.success("Showed interest");
      }
      await fetchPost();
    } catch (error) {
      console.error('Error handling interest:', error);
      toast.error("Failed to update interest");
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || !post) return;
    
    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        });
      
      setNewComment('');
      await fetchComments();
      await fetchPost();
      toast.success("Comment added");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
    }
  };

  const startChat = async (authorName: string, authorId: string) => {
    if (!user) {
      toast.error("Please sign in to start a chat");
      navigate("/auth");
      return;
    }

    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

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

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">Loading post...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!post) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center">Post not found</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/happening")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Button>

          <Card className="p-6">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles.username}`} />
                <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p 
                    className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  >
                    by {post.profiles.username}
                  </p>
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{post.description}</ReactMarkdown>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, idx) => (
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
                    onClick={handleLike}
                  >
                    <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    {post.likes_count}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </Button>
                  
                  <Button
                    variant={post.user_interested ? "default" : "outline"}
                    size="sm"
                    className="gap-2 ml-auto"
                    onClick={handleInterest}
                  >
                    <Sparkles className="w-4 h-4" />
                    {post.user_interested ? "Interested" : "Show Interest"} ({post.interests_count})
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => startChat(post.profiles.username, post.user_id)}
                  >
                    <Send className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Comments ({comments.length})</h3>
            
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
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
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button size="sm" onClick={handleComment}>
                Send
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
