#!/usr/bin/env node

/**
 * Database Setup Script for PollMaster
 * 
 * This script helps set up and verify the database schema.
 * Run with: npx tsx lib/db/setup.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { db } from './supabase-utils';

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function checkTables() {
  console.log('\n📊 Checking database tables...');
  
  const tables = ['profiles', 'polls', 'poll_options', 'votes'];
  const results = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
        results.push({ table, exists: false, error: error.message });
      } else {
        console.log(`✅ Table '${table}': exists`);
        results.push({ table, exists: true });
      }
    } catch (error) {
      console.log(`❌ Table '${table}': ${error}`);
      results.push({ table, exists: false, error: String(error) });
    }
  }
  
  return results;
}

async function checkFunctions() {
  console.log('\n🔧 Checking database functions...');
  
  const functions = [
    'get_poll_with_options',
    'can_user_vote', 
    'get_user_votes'
  ];
  
  const results = [];
  
  for (const func of functions) {
    try {
      // Try to call the function with dummy parameters
      const { data, error } = await supabase.rpc(func, { 
        poll_uuid: '00000000-0000-0000-0000-000000000000',
        user_uuid: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.log(`❌ Function '${func}': does not exist`);
        results.push({ function: func, exists: false });
      } else {
        console.log(`✅ Function '${func}': exists`);
        results.push({ function: func, exists: true });
      }
    } catch (error) {
      console.log(`❌ Function '${func}': ${error}`);
      results.push({ function: func, exists: false, error: String(error) });
    }
  }
  
  return results;
}

async function checkViews() {
  console.log('\n👁️ Checking database views...');
  
  try {
    const { data, error } = await supabase.from('poll_summary').select('*').limit(1);
    
    if (error) {
      console.log(`❌ View 'poll_summary': ${error.message}`);
      return { view: 'poll_summary', exists: false, error: error.message };
    } else {
      console.log(`✅ View 'poll_summary': exists`);
      return { view: 'poll_summary', exists: true };
    }
  } catch (error) {
    console.log(`❌ View 'poll_summary': ${error}`);
    return { view: 'poll_summary', exists: false, error: String(error) };
  }
}

async function createTestData() {
  console.log('\n🧪 Creating test data...');
  
  try {
    // Check if we have a user to work with
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ No authenticated user found. Skipping test data creation.');
      console.log('   Please sign in to create test data.');
      return false;
    }
    
    // Create a test poll
    const pollData = {
      title: "Test Poll - Database Setup",
      description: "This is a test poll created during database setup",
      isPublic: true,
      allowMultipleVotes: false,
      options: ["Option A", "Option B", "Option C"]
    };
    
    const poll = await db.polls.create(pollData, user.id);
    
    if (poll) {
      console.log(`✅ Test poll created: ${poll.id}`);
      
      // Get the poll with options
      const pollWithOptions = await db.polls.getById(poll.id);
      if (pollWithOptions) {
        console.log(`✅ Poll retrieved with ${pollWithOptions.options.length} options`);
        console.log(`   Total votes: ${pollWithOptions.total_votes}`);
      }
      
      return true;
    } else {
      console.log('❌ Failed to create test poll');
      return false;
    }
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ No authenticated user found. Skipping cleanup.');
      return;
    }
    
    // Delete test polls created by this user
    const { data: polls, error } = await supabase
      .from('polls')
      .select('id')
      .eq('created_by', user.id)
      .ilike('title', '%Test Poll - Database Setup%');
    
    if (error) {
      console.log('❌ Error finding test polls:', error.message);
      return;
    }
    
    if (polls && polls.length > 0) {
      for (const poll of polls) {
        await supabase.from('polls').delete().eq('id', poll.id);
      }
      console.log(`✅ Cleaned up ${polls.length} test polls`);
    } else {
      console.log('✅ No test polls found to clean up');
    }
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}

async function main() {
  console.log('🚀 PollMaster Database Setup\n');
  
  // Check connection
  const connected = await checkDatabaseConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Check tables
  const tableResults = await checkTables();
  const missingTables = tableResults.filter(r => !r.exists);
  
  // Check functions
  const functionResults = await checkFunctions();
  const missingFunctions = functionResults.filter(r => !r.exists);
  
  // Check views
  const viewResult = await checkViews();
  
  // Summary
  console.log('\n📋 Setup Summary:');
  console.log(`   Tables: ${tableResults.filter(r => r.exists).length}/${tableResults.length} exist`);
  console.log(`   Functions: ${functionResults.filter(r => r.exists).length}/${functionResults.length} exist`);
  console.log(`   Views: ${viewResult.exists ? 1 : 0}/1 exists`);
  
  if (missingTables.length > 0 || missingFunctions.length > 0 || !viewResult.exists) {
    console.log('\n❌ Some database objects are missing!');
    console.log('   Please run the schema.sql script in your Supabase SQL Editor.');
    
    if (missingTables.length > 0) {
      console.log('\n   Missing tables:');
      missingTables.forEach(t => console.log(`     - ${t.table}: ${t.error}`));
    }
    
    if (missingFunctions.length > 0) {
      console.log('\n   Missing functions:');
      missingFunctions.forEach(f => console.log(`     - ${f.function}`));
    }
    
    if (!viewResult.exists) {
      console.log('\n   Missing views:');
      console.log(`     - poll_summary: ${viewResult.error}`);
    }
    
    process.exit(1);
  }
  
  console.log('\n✅ Database setup is complete!');
  
  // Ask if user wants to create test data
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n🧪 Would you like to create test data? (y/N): ', async (answer: string) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      const created = await createTestData();
      
      if (created) {
        rl.question('\n🧹 Would you like to clean up the test data? (y/N): ', async (cleanupAnswer: string) => {
          if (cleanupAnswer.toLowerCase() === 'y' || cleanupAnswer.toLowerCase() === 'yes') {
            await cleanupTestData();
          }
          rl.close();
        });
      } else {
        rl.close();
      }
    } else {
      rl.close();
    }
  });
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

export { main as setupDatabase };
