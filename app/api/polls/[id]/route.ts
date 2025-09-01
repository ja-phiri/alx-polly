import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, UpdatePollData } from '@/lib/types';
import { db } from '@/lib/db/supabase-utils';
import { createServerClient } from '@supabase/ssr';

// GET /api/polls/[id] - Get a specific poll
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const poll = await db.polls.getById(id);

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { poll } } as ApiResponse<{ poll: typeof poll }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}

// PATCH /api/polls/[id] - Update a poll (owner only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: UpdatePollData = await request.json();

    // Create an authenticated Supabase client from request cookies for RLS
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // no-op
          },
        },
      }
    );

    // Basic validation
    if (
      body.title === undefined &&
      body.description === undefined &&
      body.isActive === undefined &&
      body.isPublic === undefined &&
      body.allowMultipleVotes === undefined &&
      body.expiresAt === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'No fields provided to update' } as ApiResponse,
        { status: 400 }
      );
    }

    const updated = await db.polls.update(id, body, supabase);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update poll' } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: { poll: updated } } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
