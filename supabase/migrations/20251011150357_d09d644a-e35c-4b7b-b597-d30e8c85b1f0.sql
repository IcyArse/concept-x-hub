-- Create posts table
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  links text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  interests_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create collaborators table (friends list)
CREATE TABLE public.collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  collaborator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, collaborator_id)
);

-- Enable RLS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborators
CREATE POLICY "Users can view their own collaborator relationships"
  ON public.collaborators FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = collaborator_id);

CREATE POLICY "Users can create collaborator requests"
  ON public.collaborators FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update collaborator requests sent to them"
  ON public.collaborators FOR UPDATE
  USING (auth.uid() = collaborator_id);

CREATE POLICY "Users can delete their own collaborator relationships"
  ON public.collaborators FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = collaborator_id);

-- Create function to update post timestamp
CREATE OR REPLACE FUNCTION public.update_post_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for post updates
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_timestamp();

-- Create indexes for better search performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX idx_collaborators_collaborator_id ON public.collaborators(collaborator_id);