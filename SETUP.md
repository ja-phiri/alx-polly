# PollMaster Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=alx-polly
```

## Database Setup

1. In your Supabase dashboard, go to SQL Editor
2. Run the following SQL to create the necessary tables:

```sql
-- Create polls table
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  allow_multiple_votes BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_options table
CREATE TABLE poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, option_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public polls" ON polls
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own polls" ON polls
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view poll options for public polls" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls WHERE polls.id = poll_options.poll_id AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view poll options for their own polls" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls WHERE polls.id = poll_options.poll_id AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create poll options for their own polls" ON poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls WHERE polls.id = poll_options.poll_id AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view votes for public polls" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls WHERE polls.id = votes.poll_id AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view their own votes" ON votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can vote on polls" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- ✅ User authentication with Supabase
- ✅ Protected routes
- ✅ Login and registration forms
- ✅ User dashboard
- ✅ Navigation with authentication state
- ✅ Toast notifications
- ✅ Responsive design

## Next Steps

- Implement poll creation functionality
- Add voting system
- Create poll analytics
- Add social sharing features
