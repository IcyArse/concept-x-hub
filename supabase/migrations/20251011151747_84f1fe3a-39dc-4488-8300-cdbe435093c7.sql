-- Add foreign key for post_comments user_id to profiles
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key for post_likes user_id to profiles
ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key for post_interests user_id to profiles
ALTER TABLE public.post_interests
ADD CONSTRAINT post_interests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;