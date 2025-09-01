# PollMaster Database Schema

This directory contains the complete database schema and utilities for the PollMaster application using Supabase.

## 📋 Table of Contents

- [Schema Overview](#schema-overview)
- [Setup Instructions](#setup-instructions)
- [Database Tables](#database-tables)
- [Row Level Security](#row-level-security)
- [Database Functions](#database-functions)
- [Usage Examples](#usage-examples)
- [TypeScript Integration](#typescript-integration)

## 🏗️ Schema Overview

The database schema consists of four main tables:

1. **`profiles`** - User profiles (extends Supabase auth.users)
2. **`polls`** - Poll definitions and metadata
3. **`poll_options`** - Individual options for each poll
4. **`votes`** - User votes on poll options

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

### 2. Set Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the script

### 4. Verify Setup

Check that all tables, functions, and policies were created successfully in the Supabase dashboard.

## 📊 Database Tables

### Profiles Table

```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Purpose**: Stores user profile information that extends Supabase's built-in auth system.

### Polls Table

```sql
CREATE TABLE public.polls (
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
```

**Purpose**: Stores poll metadata and configuration.

### Poll Options Table

```sql
CREATE TABLE public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Purpose**: Stores individual options for each poll.

### Votes Table

```sql
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(poll_id, option_id, user_id)
);
```

**Purpose**: Stores user votes with a unique constraint to prevent duplicate votes.

## 🔐 Row Level Security

All tables have Row Level Security (RLS) enabled with the following policies:

### Profiles Policies
- Users can view their own profile
- Users can update their own profile
- Users can view public profiles

### Polls Policies
- Users can view public polls
- Users can view their own polls (public or private)
- Users can create polls
- Users can update/delete their own polls

### Poll Options Policies
- Users can view options for accessible polls
- Poll creators can manage options

### Votes Policies
- Users can view votes for accessible polls
- Users can vote on accessible polls (with validation)
- Users can delete their own votes

## 🛠️ Database Functions

### `get_poll_with_options(poll_uuid UUID)`

Returns a poll with all its options and vote counts in a single query.

**Usage**:
```sql
SELECT * FROM get_poll_with_options('poll-uuid-here');
```

### `can_user_vote(poll_uuid UUID, user_uuid UUID)`

Checks if a user can vote on a specific poll based on:
- Poll is active and not expired
- Poll is public or user is creator
- User hasn't already voted (if multiple votes not allowed)

**Usage**:
```sql
SELECT can_user_vote('poll-uuid', 'user-uuid');
```

### `get_user_votes(poll_uuid UUID, user_uuid UUID)`

Returns all votes cast by a user for a specific poll.

**Usage**:
```sql
SELECT * FROM get_user_votes('poll-uuid', 'user-uuid');
```

## 💻 Usage Examples

### Creating a Poll

```typescript
import { db } from '@/lib/db/supabase-utils';

const pollData = {
  title: "What's your favorite color?",
  description: "Choose your preferred color",
  isPublic: true,
  allowMultipleVotes: false,
  options: ["Red", "Blue", "Green", "Yellow"]
};

const userId = await db.utils.getCurrentUserId();
const poll = await db.polls.create(pollData, userId!);
```

### Fetching a Poll with Options

```typescript
import { db } from '@/lib/db/supabase-utils';

const poll = await db.polls.getById('poll-id');
if (poll) {
  console.log('Poll:', poll.title);
  console.log('Options:', poll.options);
  console.log('Total votes:', poll.total_votes);
}
```

### Voting on a Poll

```typescript
import { db } from '@/lib/db/supabase-utils';

const userId = await db.utils.getCurrentUserId();
const canVote = await db.polls.canUserVote('poll-id', userId!);

if (canVote) {
  const vote = await db.votes.create('poll-id', 'option-id', userId!);
  console.log('Vote recorded:', vote);
}
```

### Getting User's Votes

```typescript
import { db } from '@/lib/db/supabase-utils';

const userId = await db.utils.getCurrentUserId();
const userVotes = await db.votes.getUserVotesForPoll('poll-id', userId!);
console.log('User votes:', userVotes);
```

## 🔧 TypeScript Integration

The database is fully typed with TypeScript. Import types from the types directory:

```typescript
import { 
  Poll, 
  PollOption, 
  Vote, 
  Profile,
  PollWithOptions,
  PollSummary 
} from '@/lib/types';
```

### Database Types

All database operations return properly typed data:

```typescript
// Poll with options and vote counts
const poll: PollWithOptions = await db.polls.getById('poll-id');

// Poll summary for lists
const polls: PollSummary[] = await db.polls.getAll();

// User profile
const profile: Profile = await db.profiles.getById('user-id');
```

## 📈 Performance Optimizations

### Indexes

The schema includes optimized indexes for common queries:

- `idx_polls_created_by` - For finding user's polls
- `idx_polls_is_active` - For filtering active polls
- `idx_polls_is_public` - For filtering public polls
- `idx_votes_poll_user` - For checking user votes

### Views

The `poll_summary` view provides aggregated data for poll listings:

```sql
CREATE VIEW public.poll_summary AS
SELECT 
    p.*,
    COUNT(DISTINCT po.id) as option_count,
    COUNT(DISTINCT v.id) as total_votes,
    COUNT(DISTINCT v.user_id) as unique_voters
FROM public.polls p
LEFT JOIN public.poll_options po ON p.id = po.poll_id
LEFT JOIN public.votes v ON p.id = v.poll_id
GROUP BY p.id, p.title, p.description, p.is_active, p.is_public, p.allow_multiple_votes, p.expires_at, p.created_by, p.created_at, p.updated_at;
```

## 🧪 Testing

To test the database schema:

1. Create a test poll
2. Add options to the poll
3. Vote on the poll
4. Verify vote counts and user permissions

Example test script:

```typescript
import { db } from '@/lib/db/supabase-utils';

async function testDatabase() {
  const userId = await db.utils.getCurrentUserId();
  if (!userId) {
    console.log('User not authenticated');
    return;
  }

  // Create a test poll
  const poll = await db.polls.create({
    title: "Test Poll",
    description: "Testing the database",
    isPublic: true,
    allowMultipleVotes: false,
    options: ["Option 1", "Option 2", "Option 3"]
  }, userId);

  if (poll) {
    console.log('Poll created:', poll.id);
    
    // Get the poll with options
    const pollWithOptions = await db.polls.getById(poll.id);
    console.log('Poll with options:', pollWithOptions);
  }
}
```

## 🔄 Migrations

When making changes to the schema:

1. Create a new migration file
2. Test the migration in a development environment
3. Apply to production using Supabase migrations
4. Update TypeScript types if needed

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
