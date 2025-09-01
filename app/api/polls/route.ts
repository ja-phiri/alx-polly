import { NextRequest, NextResponse } from 'next/server';
import { CreatePollData, ApiResponse, PollSummary } from '@/lib/types';
import { db } from '@/lib/db/supabase-utils';
import { createServerClient } from '@supabase/ssr';

// GET /api/polls - List all polls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const publicOnly = searchParams.get('public') === 'true';

    let polls: PollSummary[];

    if (publicOnly) {
      polls = await db.polls.getPublicPolls(limit, offset);
    } else {
      polls = await db.polls.getAll(limit, offset);
    }

    return NextResponse.json(
      { success: true, data: { polls } } as ApiResponse<{ polls: PollSummary[] }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/polls - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // This will be handled by the response
          },
        },
      }
    );
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as ApiResponse,
        { status: 401 }
      );
    }

    const body: CreatePollData = await request.json();
    const { title, description, isPublic, allowMultipleVotes, expiresAt, options } = body;

    // Validate input
    if (!title || !options || options.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Title and at least 2 options are required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Filter out empty options
    const validOptions = options.filter(option => option.trim().length > 0);
    
    if (validOptions.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 valid options are required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Create poll with valid options
    const pollData = {
      title: title.trim(),
      description: description?.trim(),
      isPublic,
      allowMultipleVotes,
      expiresAt,
      options: validOptions,
    };

    const poll = await db.polls.create(pollData, user.id, supabase);

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Failed to create poll' } as ApiResponse,
        { status: 500 }
      );
    }

    // Get the created poll with options
    const pollWithOptions = await db.polls.getById(poll.id);

    return NextResponse.json(
      { 
        success: true, 
        data: { poll: pollWithOptions },
        message: 'Poll created successfully'
      } as ApiResponse<{ poll: typeof pollWithOptions }>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
