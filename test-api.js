#!/usr/bin/env node

/**
 * Test script for API endpoints
 * Run with: node test-api.js
 */

const testAPI = async () => {
  console.log('🧪 Testing API Endpoints\n');

  try {
    // Test GET /api/polls
    console.log('📊 Testing GET /api/polls...');
    
    const pollsResponse = await fetch('http://localhost:3000/api/polls?public=true');
    const pollsResult = await pollsResponse.json();

    console.log('Status:', pollsResponse.status);
    console.log('Response:', JSON.stringify(pollsResult, null, 2));

    // Test POST /api/polls (without auth - should fail)
    console.log('\n📝 Testing POST /api/polls (without auth)...');
    
    const testPoll = {
      title: "Test Poll - API Test",
      description: "This is a test poll to verify the API functionality",
      isPublic: true,
      allowMultipleVotes: false,
      expiresAt: null,
      options: ["Option A", "Option B", "Option C"]
    };

    const createResponse = await fetch('http://localhost:3000/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPoll),
    });

    const createResult = await createResponse.json();

    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
};

// Run the test
testAPI();
