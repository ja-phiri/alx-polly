# Poll Creation Functionality Guide

This guide explains how to use the poll creation functionality that has been implemented in the PollMaster application.

## 🚀 Overview

The poll creation system allows authenticated users to create polls with the following features:

- **Title and Description**: Basic poll information
- **Public/Private**: Control who can view and vote on the poll
- **Multiple Votes**: Allow users to vote for multiple options
- **Expiration Date**: Set when the poll should close
- **Dynamic Options**: Add or remove poll options as needed

## 📋 Prerequisites

Before using the poll creation functionality, ensure you have:

1. **Database Setup**: Run the schema.sql script in your Supabase project
2. **Environment Variables**: Set up your Supabase credentials in `.env.local`
3. **Authentication**: Users must be signed in to create polls
4. **Dependencies**: All required packages are installed

## 🛠️ Implementation Details

### Database Schema

The poll creation uses these database tables:

- **`polls`**: Main poll information
- **`poll_options`**: Individual poll options
- **`votes`**: User votes (for future voting functionality)

### API Endpoints

#### POST `/api/polls`
Creates a new poll with options.

**Request Body:**
```json
{
  "title": "What's your favorite color?",
  "description": "Choose your preferred color",
  "isPublic": true,
  "allowMultipleVotes": false,
  "expiresAt": "2024-12-31T23:59:59Z",
  "options": ["Red", "Blue", "Green", "Yellow"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "poll": {
      "poll_id": "uuid",
      "title": "What's your favorite color?",
      "description": "Choose your preferred color",
      "is_active": true,
      "is_public": true,
      "allow_multiple_votes": false,
      "expires_at": "2024-12-31T23:59:59Z",
      "created_by": "user-uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "total_votes": 0,
      "options": [
        {
          "id": "option-uuid",
          "text": "Red",
          "votes": 0,
          "poll_id": "poll-uuid",
          "created_at": "2024-01-01T00:00:00Z"
        }
      ]
    }
  },
  "message": "Poll created successfully"
}
```

#### GET `/api/polls`
Fetches polls with optional filtering.

**Query Parameters:**
- `limit`: Number of polls to return (default: 20)
- `offset`: Number of polls to skip (default: 0)
- `public`: Show only public polls (default: false)

### Components

#### CreatePollForm
Located at `components/polls/create-poll-form.tsx`

**Features:**
- Form validation
- Dynamic option management
- Real-time feedback
- Error handling
- Success redirection

**Usage:**
```tsx
import { CreatePollForm } from "@/components/polls/create-poll-form"

export default function CreatePollPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <CreatePollForm />
    </div>
  )
}
```

#### PollsList
Located at `components/polls/polls-list.tsx`

**Features:**
- Fetches polls from API
- Loading states
- Error handling
- Empty states
- Public/private filtering

**Usage:**
```tsx
import { PollsList } from "@/components/polls/polls-list"

// Show public polls only
<PollsList publicOnly={true} />

// Show all polls
<PollsList publicOnly={false} />
```

## 🔐 Security Features

### Authentication
- All poll creation requires user authentication
- Users can only create polls for themselves
- API routes validate user sessions

### Row Level Security (RLS)
- Users can only view public polls or their own polls
- Users can only modify their own polls
- Vote permissions are enforced at the database level

### Input Validation
- Title is required
- At least 2 options are required
- Empty options are filtered out
- Date validation for expiration

## 🎨 User Interface

### Form Features
- **Title Input**: Required field with placeholder
- **Description Textarea**: Optional context
- **Public/Private Toggle**: Switch component
- **Multiple Votes Toggle**: Switch component
- **Dynamic Options**: Add/remove options with validation
- **Expiration Date**: Optional datetime picker
- **Submit Button**: With loading state

### Visual Feedback
- **Loading States**: Spinner during submission
- **Toast Notifications**: Success/error messages
- **Form Validation**: Real-time error messages
- **Success Redirection**: Navigate to poll view

## 🧪 Testing

### Manual Testing
1. Navigate to `/polls/create`
2. Fill out the form with test data
3. Submit and verify success
4. Check the created poll in the database

### Automated Testing
Run the test script:
```bash
node test-poll-creation.js
```

### Database Verification
Use the setup script to verify the database:
```bash
npx tsx lib/db/setup.ts
```

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Settings
- UUID primary keys
- Automatic timestamps
- Cascade deletes
- Optimized indexes

## 🚨 Error Handling

### Common Errors
1. **Authentication Required**: User not signed in
2. **Validation Errors**: Missing title or options
3. **Database Errors**: Connection or permission issues
4. **Network Errors**: API request failures

### Error Recovery
- Form validation prevents invalid submissions
- Toast notifications inform users of errors
- Retry mechanisms for network failures
- Graceful fallbacks for missing data

## 📈 Performance

### Optimizations
- Database indexes for common queries
- Efficient API responses
- Client-side form validation
- Optimistic UI updates

### Monitoring
- Console logging for debugging
- Error tracking for production
- Performance metrics for API calls

## 🔄 Future Enhancements

### Planned Features
- **Poll Templates**: Pre-defined poll types
- **Rich Text**: Markdown support for descriptions
- **Media Attachments**: Images and videos
- **Poll Categories**: Organized poll browsing
- **Advanced Analytics**: Detailed voting statistics

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Caching**: Redis for improved performance
- **Search**: Full-text search for polls
- **Pagination**: Infinite scroll for large lists

## 📚 Related Documentation

- [Database Schema](./lib/db/README.md)
- [API Documentation](./API.md)
- [Authentication Guide](./AUTH.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🆘 Troubleshooting

### Common Issues

**Poll creation fails with 401 error**
- Ensure user is authenticated
- Check Supabase session validity
- Verify environment variables

**Form validation errors**
- Check required fields are filled
- Ensure at least 2 options are provided
- Validate date format for expiration

**Database connection errors**
- Verify Supabase project is active
- Check network connectivity
- Validate database schema is applied

### Getting Help
1. Check the browser console for errors
2. Review the server logs
3. Verify database setup with setup script
4. Test API endpoints directly

---

For more information, refer to the main project documentation or contact the development team.
