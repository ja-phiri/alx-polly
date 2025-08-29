import { NextRequest, NextResponse } from 'next/server';
import { Poll, ApiResponse } from '@/lib/types';

// POST /api/polls/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { optionId } = body;

    // Validate input
    if (!optionId) {
      return NextResponse.json(
        { success: false, error: 'Option ID is required' } as ApiResponse,
        { status: 400 }
      );
    }

    // TODO: Implement actual authentication check
    // TODO: Implement actual database operation to record vote

    // Mock updated poll data with incremented vote
    const mockPoll: Poll = {
      id,
      title: 'What\'s your favorite programming language?',
      description: 'Choose your preferred programming language for web development',
      isActive: true,
      isPublic: true,
      allowMultipleVotes: false,
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalVotes: 16, // Incremented
      options: [
        { id: '1', text: 'JavaScript', votes: 8, pollId: id, createdAt: new Date() },
        { id: '2', text: 'TypeScript', votes: 6, pollId: id, createdAt: new Date() }, // Incremented
        { id: '3', text: 'Python', votes: 2, pollId: id, createdAt: new Date() },
      ],
    };

    return NextResponse.json(
      { success: true, data: { poll: mockPoll } } as ApiResponse<{ poll: Poll }>,
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
