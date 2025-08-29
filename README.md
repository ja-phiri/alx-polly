# PollMaster - Next.js Polling Application

A modern polling application built with Next.js 14, TypeScript, and Shadcn UI components.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Poll Management**: Create, view, and manage polls
- **Voting System**: Vote on polls with real-time updates
- **Responsive Design**: Modern UI that works on all devices
- **Type Safety**: Full TypeScript support throughout the application

## 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (grouped)
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication API endpoints
│   │   │   ├── login/            # POST /api/auth/login
│   │   │   └── register/         # POST /api/auth/register
│   │   └── polls/                # Polls API endpoints
│   │       ├── route.ts          # GET/POST /api/polls
│   │       └── [id]/             # Individual poll operations
│   │           ├── route.ts      # GET /api/polls/[id]
│   │           └── vote/         # POST /api/polls/[id]/vote
│   ├── dashboard/                # User dashboard
│   ├── polls/                    # Polls pages
│   │   ├── page.tsx              # Polls listing
│   │   ├── create/               # Create new poll
│   │   └── [id]/                 # Individual poll view
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Login form
│   │   └── register-form.tsx     # Registration form
│   ├── polls/                    # Poll-related components
│   │   ├── polls-list.tsx        # Polls listing component
│   │   ├── poll-view.tsx         # Individual poll view
│   │   └── create-poll-form.tsx  # Create poll form
│   ├── dashboard/                # Dashboard components
│   ├── navigation.tsx            # Main navigation
│   ├── protected-route.tsx       # Route protection component
│   └── providers.tsx             # Context providers
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Authentication hook
│   └── use-polls.ts              # Polls management hook
├── lib/                          # Utility libraries
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Main types file
│   ├── auth/                     # Authentication utilities
│   │   └── auth-utils.ts         # Auth helper functions
│   ├── db/                       # Database utilities
│   │   └── db-utils.ts           # Database operations
│   └── utils.ts                  # General utilities
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Context + Custom Hooks

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (for future implementation)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polling_app
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication (for future implementation)
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Architecture Overview

### Authentication Flow
1. User registers/logs in via `/login` or `/register`
2. Authentication state is managed via `useAuth` hook
3. Protected routes use `ProtectedRoute` component
4. JWT tokens are stored in localStorage (for development)

### Poll Management
1. Users can browse polls at `/polls`
2. Authenticated users can create polls at `/polls/create`
3. Users can vote on polls via API endpoints
4. Real-time updates using custom hooks

### API Structure
- RESTful API design with Next.js API routes
- Consistent error handling and response format
- Type-safe request/response handling
- Placeholder implementations ready for database integration

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL/Prisma)
- [ ] Real-time voting with WebSockets
- [ ] Poll analytics and charts
- [ ] Email notifications
- [ ] Social sharing features
- [ ] Advanced poll types (ranked choice, etc.)
- [ ] Mobile app (React Native)

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
