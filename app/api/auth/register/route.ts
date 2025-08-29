import { NextRequest, NextResponse } from 'next/server';
import { RegisterData, AuthResponse, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' } as ApiResponse,
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' } as ApiResponse,
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse,
        { status: 400 }
      );
    }

    // TODO: Implement actual registration logic
    // This is a placeholder that should be replaced with real registration
    console.log('Registration attempt:', { name, email });

    // Mock successful response
    const mockAuthResponse: AuthResponse = {
      user: {
        id: '1',
        email: email,
        name: name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'mock-jwt-token-' + Date.now(),
    };

    return NextResponse.json(
      { success: true, data: mockAuthResponse } as ApiResponse<AuthResponse>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
