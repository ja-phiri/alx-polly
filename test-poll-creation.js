#!/usr/bin/env node

/**
 * Test script for poll creation functionality
 * Run with: node test-poll-creation.js
 */

const testPollCreation = async () => {
  console.log('🧪 Testing Poll Creation Functionality\n');

  // Test data
  const testPoll = {
    title: "Test Poll - API Test",
    description: "This is a test poll to verify the API functionality",
    isPublic: true,
    allowMultipleVotes: false,
    expiresAt: null,
    options: ["Option A", "Option B", "Option C"]
  };

  try {
    console.log('📝 Creating test poll...');
    
    const response = await fetch('http://localhost:3000/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPoll),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Poll created successfully!');
      console.log('   Poll ID:', result.data.poll.poll_id);
      console.log('   Title:', result.data.poll.title);
      console.log('   Options:', result.data.poll.options.length);
      console.log('   Total votes:', result.data.poll.total_votes);
    } else {
      console.log('❌ Failed to create poll');
      console.log('   Error:', result.error);
      console.log('   Status:', response.status);
    }

    // Test fetching polls
    console.log('\n📊 Testing poll fetching...');
    
    const pollsResponse = await fetch('http://localhost:3000/api/polls?public=true');
    const pollsResult = await pollsResponse.json();

    if (pollsResponse.ok && pollsResult.success) {
      console.log('✅ Polls fetched successfully!');
      console.log('   Total polls:', pollsResult.data.polls.length);
    } else {
      console.log('❌ Failed to fetch polls');
      console.log('   Error:', pollsResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. The development server is running (npm run dev)');
    console.log('   2. You are authenticated in the browser');
    console.log('   3. The database schema is set up correctly');
  }
};

// Run the test
testPollCreation();
