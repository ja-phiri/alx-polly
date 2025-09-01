# Authentication Guide for PollMaster

This guide will help you get authenticated and create polls successfully.

## 🔍 The Problem

You're getting an "Internal server error" when trying to create polls because **authentication is required**. The API returns a 401 Unauthorized error when you're not signed in.

## ✅ Solution: Get Authenticated

### Step 1: Create an Account

1. **Go to the registration page**: `http://localhost:3000/register`
2. **Fill out the form**:
   - Name: Your full name
   - Email: A valid email address
   - Password: A strong password (at least 6 characters)
3. **Click "Sign Up"**

### Step 2: Confirm Your Email (if required)

- Check your email for a confirmation link
- Click the link to confirm your account
- If email confirmation is disabled in your Supabase project, you can skip this step

### Step 3: Sign In

1. **Go to the login page**: `http://localhost:3000/login`
2. **Enter your credentials**:
   - Email: The email you used to register
   - Password: Your password
3. **Click "Sign In"**

### Step 4: Create Your First Poll

1. **After signing in, go to**: `http://localhost:3000/polls/create`
2. **Fill out the poll form**:
   - Title: "What's your favorite color?"
   - Description: "Choose your preferred color"
   - Public Poll: ✅ (checked)
   - Allow Multiple Votes: ❌ (unchecked)
   - Options: Add "Red", "Blue", "Green"
   - End Date: Leave empty
3. **Click "Create Poll"**

## 🧪 Alternative: Use the Test Page

If you want to test authentication quickly:

1. **Open the test page**: `file:///path/to/your/project/test-auth.html`
2. **Sign up with test credentials**:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. **Sign in with the same credentials**
4. **Test poll creation**

## 🔧 Troubleshooting

### "Email confirmation required"

If you get this error:
1. Check your email for a confirmation link
2. Click the link to confirm your account
3. Try signing in again

### "Invalid login credentials"

If you can't sign in:
1. Make sure you're using the correct email and password
2. Try creating a new account with different credentials
3. Check if email confirmation is required

### "Internal server error" persists

If you're still getting errors after authentication:
1. Check the browser console for detailed error messages
2. Make sure the development server is running
3. Verify your Supabase environment variables are correct

## 📋 Quick Test Commands

Test if you're authenticated:

```bash
# This should return 401 if not authenticated
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test","options":["A","B"]}' \
  http://localhost:3000/api/polls

# This should return 200 and empty polls array
curl http://localhost:3000/api/polls?public=true
```

## 🎯 Expected Flow

1. **Unauthenticated**: Can view public polls, but can't create them
2. **Authenticated**: Can create polls, view all polls, and vote
3. **Poll Creation**: Should redirect to the poll view page after successful creation

## 🔐 Security Notes

- All poll creation requires authentication
- Users can only edit their own polls
- Public polls are visible to everyone
- Private polls are only visible to the creator

## 📞 Need Help?

If you're still having issues:

1. **Check the browser console** for JavaScript errors
2. **Check the terminal** for server errors
3. **Verify your Supabase setup** with the database setup script:
   ```bash
   npx tsx lib/db/setup.ts
   ```

The key is to **sign in first** before trying to create polls. Once you're authenticated, the poll creation should work perfectly!
