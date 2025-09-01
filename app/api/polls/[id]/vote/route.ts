import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';

// POST /api/polls/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { optionId } = body as { optionId?: string };

    // Validate input
    if (!optionId) {
      return NextResponse.json(
        { success: false, error: 'Option ID is required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Create authenticated Supabase client using request cookies (for RLS)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // no-op for API route
          },
        },
      }
    );

    // Ensure user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as ApiResponse,
        { status: 401 }
      );
    }

    // Validate that option belongs to the poll
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id, poll_id')
      .eq('id', optionId)
      .eq('poll_id', id)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { success: false, error: 'Invalid option for this poll' } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if user can vote (handles multiple vote rules and active state)
    const { data: canVote, error: canVoteError } = await supabase.rpc('can_user_vote', {
      poll_uuid: id,
      user_uuid: user.id,
    });

    if (canVoteError) {
      console.error('Error checking can_user_vote:', canVoteError);
      return NextResponse.json(
        { success: false, error: 'Failed to validate vote' } as ApiResponse,
        { status: 400 }
      );
    }

    if (!canVote) {
      return NextResponse.json(
        { success: false, error: 'You cannot vote on this poll' } as ApiResponse,
        { status: 400 }
      );
    }

    // Insert vote
    const { error: insertError } = await supabase.from('votes').insert({
      poll_id: id,
      option_id: optionId,
      user_id: user.id,
    });

    if (insertError) {
      console.error('Error inserting vote:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record vote' } as ApiResponse,
        { status: 400 }
      );
    }

    // Fetch updated poll with options and vote counts
    const { data: pollData, error: pollError } = await supabase.rpc('get_poll_with_options', {
      poll_uuid: id,
    });

    if (pollError || !pollData || pollData.length === 0) {
      console.error('Error fetching updated poll:', pollError);
      return NextResponse.json(
        { success: true, message: 'Vote recorded' } as ApiResponse,
        { status: 200 }
      );
    }

    const updatedPoll = pollData[0];

    return NextResponse.json(
      { success: true, data: { poll: updatedPoll } } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
