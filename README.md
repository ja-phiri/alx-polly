# PollMaster - Next.js Polling Application

A modern polling application built with Next.js 15, TypeScript, Supabase, and Shadcn UI components. Create polls, gather opinions, and make decisions together with real-time results.

## 🚀 Features

- **🔐 Supabase Authentication**: Secure user registration, login, and session management
- **🛡️ Protected Routes**: Automatic route protection with middleware
- **📊 Poll Management**: Create, view, and manage polls (ready for implementation)
- **🗳️ Voting System**: Vote on polls with real-time updates (ready for implementation)
- **📱 Responsive Design**: Modern UI that works on all devices
- **🔒 Type Safety**: Full TypeScript support throughout the application
- **🔔 Toast Notifications**: User-friendly feedback for all actions
- **🎨 Modern UI**: Beautiful interface built with Shadcn UI and Tailwind CSS

## 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (grouped)
│   │   ├── login/                # Login page with Supabase auth
│   │   └── register/             # Registration page with Supabase auth
│   ├── dashboard/                # Protected user dashboard
│   ├── polls/                    # Polls pages (ready for implementation)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Landing page with auth-aware content
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── input.tsx             # Input component
│   │   ├── label.tsx             # Label component
│   │   ├── select.tsx            # Select component
│   │   ├── dropdown-menu.tsx     # Dropdown menu component
│   │   └── icons.tsx             # Icon components
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Supabase login form
│   │   └── register-form.tsx     # Supabase registration form
│   ├── polls/                    # Poll-related components
│   │   └── create-poll-form.tsx  # Create poll form
│   ├── dashboard/                # Dashboard components
│   ├── navigation.tsx            # Main navigation with auth state
│   └── protected-route.tsx       # Route protection component
├── contexts/                     # React Context providers
│   └── auth-context.tsx          # Supabase authentication context
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configurations
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Main types file
│   └── utils.ts                  # General utilities
├── middleware.ts                 # Next.js middleware for auth protection
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Context
- **Notifications**: Sonner
- **Form Handling**: React Hook Form (ready for implementation)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API

4. Set up environment variables:
```bash
cp env.example .env.local
```

5. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PollMaster
```

6. Set up the database (see SETUP.md for detailed instructions):
   - Run the SQL commands in your Supabase SQL Editor
   - This creates the necessary tables and security policies

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Architecture Overview

### Authentication Flow
1. **User Registration**: Users sign up via `/register` with email/password
2. **Email Verification**: Supabase sends verification email (configurable)
3. **User Login**: Users authenticate via `/login`
4. **Session Management**: Supabase handles session persistence
5. **Route Protection**: Middleware automatically protects routes
6. **State Management**: Auth context provides user state throughout the app

### Protected Routes
- `/dashboard` - User dashboard (requires authentication)
- `/polls/create` - Create new polls (requires authentication)
- Future poll management routes will be protected

### Public Routes
- `/` - Landing page with auth-aware content
- `/login` - Login page
- `/register` - Registration page
- `/polls` - Browse public polls (ready for implementation)

### Supabase Integration
- **Client-side**: Browser client for user interactions
- **Server-side**: Server client for API routes
- **Middleware**: Automatic session refresh and route protection
- **Row Level Security**: Database-level security policies

## 🔐 Authentication Features

- ✅ **User Registration** with email verification
- ✅ **Secure Login** with Supabase Auth
- ✅ **Session Management** with automatic refresh
- ✅ **Protected Routes** with middleware
- ✅ **User Context** available throughout the app
- ✅ **Logout** functionality
- ✅ **Loading States** and error handling
- ✅ **Toast Notifications** for user feedback

## 🎨 UI/UX Features

- ✅ **Responsive Design** that works on all devices
- ✅ **Modern Interface** built with Shadcn UI
- ✅ **Dark/Light Mode** support (ready for implementation)
- ✅ **Loading States** for better user experience
- ✅ **Toast Notifications** for immediate feedback
- ✅ **Accessible Components** following WCAG guidelines

## 🔮 Ready for Implementation

The authentication system is complete and ready for you to build:

- **Poll Creation**: Forms and components are ready
- **Voting System**: Database schema is prepared
- **Real-time Updates**: Supabase real-time subscriptions ready
- **Analytics**: Dashboard components are in place
- **Social Features**: Sharing and collaboration ready

## 📚 Documentation

- **SETUP.md** - Detailed setup instructions for Supabase
- **Database Schema** - Complete SQL for polls, options, and votes
- **Security Policies** - Row Level Security for data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using Next.js, Supabase, and Shadcn UI**
