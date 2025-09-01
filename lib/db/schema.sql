-- PollMaster Database Schema
-- This file contains the complete database schema for the PollMaster application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE poll_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE vote_type AS ENUM ('single', 'multiple');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL,
    allow_multiple_votes BOOLEAN DEFAULT false NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(poll_id, option_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_is_public ON public.polls(is_public);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON public.polls(expires_at);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON public.polls(created_at);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON public.votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_user ON public.votes(poll_id, user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync user profile on auth.users changes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get poll with options and vote counts
CREATE OR REPLACE FUNCTION get_poll_with_options(poll_uuid UUID)
RETURNS TABLE (
    poll_id UUID,
    title TEXT,
    description TEXT,
    is_active BOOLEAN,
    is_public BOOLEAN,
    allow_multiple_votes BOOLEAN,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    total_votes BIGINT,
    options JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH poll_options_with_votes AS (
        SELECT
            po.poll_id,
            po.id,
            po.text,
            po.created_at,
            COUNT(v.id) AS vote_count
        FROM public.poll_options po
        LEFT JOIN public.votes v ON po.id = v.option_id
        WHERE po.poll_id = poll_uuid
        GROUP BY po.poll_id, po.id
    ),
    aggregated_options AS (
        SELECT
            powv.poll_id,
            SUM(powv.vote_count) as total_votes,
            json_agg(
                json_build_object(
                    'id', powv.id,
                    'text', powv.text,
                    'votes', powv.vote_count,
                    'poll_id', powv.poll_id,
                    'created_at', powv.created_at
                ) ORDER BY powv.created_at
            ) as options
        FROM poll_options_with_votes powv
        GROUP BY powv.poll_id
    )
    SELECT
        p.id,
        p.title,
        p.description,
        p.is_active,
        p.is_public,
        p.allow_multiple_votes,
        p.expires_at,
        p.created_by,
        p.created_at,
        p.updated_at,
        COALESCE(ao.total_votes, 0),
        COALESCE(ao.options, '[]'::json)
    FROM public.polls p
    LEFT JOIN aggregated_options ao ON p.id = ao.poll_id
    WHERE p.id = poll_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.profiles
    FOR SELECT USING (true);

-- Polls policies
CREATE POLICY "Users can view public polls" ON public.polls
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON public.polls
    FOR UPDATE USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" ON public.polls
    FOR DELETE USING (auth.uid() = created_by);

-- Poll options policies
CREATE POLICY "Users can view options for accessible polls" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND (p.is_public = true OR p.created_by = auth.uid())
        )
    );

CREATE POLICY "Poll creators can manage options" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND p.created_by = auth.uid()
        )
    );

-- Votes policies
CREATE POLICY "Users can view votes for accessible polls" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND (p.is_public = true OR p.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can vote on accessible polls" ON public.votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND (p.is_public = true OR p.created_by = auth.uid())
            AND p.is_active = true
            AND (p.expires_at IS NULL OR p.expires_at > NOW())
        )
        AND EXISTS (
            SELECT 1 FROM public.poll_options po 
            WHERE po.id = option_id 
            AND po.poll_id = poll_id
        )
    );

CREATE POLICY "Users can delete their own votes" ON public.votes
    FOR DELETE USING (auth.uid() = user_id);

-- Function to check if user can vote on a poll
CREATE OR REPLACE FUNCTION can_user_vote(poll_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    poll_record RECORD;
    existing_votes INTEGER;
BEGIN
    -- Get poll details
    SELECT * INTO poll_record FROM public.polls WHERE id = poll_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if poll is active and not expired
    IF NOT poll_record.is_active OR (poll_record.expires_at IS NOT NULL AND poll_record.expires_at <= NOW()) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if poll is public or user is creator
    IF NOT poll_record.is_public AND poll_record.created_by != user_uuid THEN
        RETURN FALSE;
    END IF;
    
    -- Count existing votes by user
    SELECT COUNT(*) INTO existing_votes 
    FROM public.votes 
    WHERE poll_id = poll_uuid AND user_id = user_uuid;
    
    -- If multiple votes not allowed and user already voted, deny
    IF NOT poll_record.allow_multiple_votes AND existing_votes > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's votes for a poll
CREATE OR REPLACE FUNCTION get_user_votes(poll_uuid UUID, user_uuid UUID)
RETURNS TABLE (
    option_id UUID,
    option_text TEXT,
    voted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.option_id,
        po.text as option_text,
        v.created_at as voted_at
    FROM public.votes v
    JOIN public.poll_options po ON v.option_id = po.id
    WHERE v.poll_id = poll_uuid AND v.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.polls TO authenticated;
GRANT ALL ON public.poll_options TO authenticated;
GRANT ALL ON public.votes TO authenticated;
GRANT EXECUTE ON FUNCTION get_poll_with_options(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_vote(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_votes(UUID, UUID) TO authenticated;

-- Create some helpful views
CREATE OR REPLACE VIEW public.poll_summary AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.is_active,
    p.is_public,
    p.allow_multiple_votes,
    p.expires_at,
    p.created_by,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT po.id) as option_count,
    COUNT(DISTINCT v.id) as total_votes,
    COUNT(DISTINCT v.user_id) as unique_voters
FROM public.polls p
LEFT JOIN public.poll_options po ON p.id = po.poll_id
LEFT JOIN public.votes v ON p.id = v.poll_id
GROUP BY p.id, p.title, p.description, p.is_active, p.is_public, p.allow_multiple_votes, p.expires_at, p.created_by, p.created_at, p.updated_at;

GRANT SELECT ON public.poll_summary TO authenticated;
