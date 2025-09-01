# PollMaster Project Rules

## 🏗️ Architecture & Structure

### 1. App Router Organization
- Use Next.js 15 App Router with grouped routes for related functionality
- Group authentication routes under `app/(auth)/` for shared layouts
- Keep API routes in `app/api/` following RESTful conventions
- Place protected pages (dashboard, polls) at root level with middleware protection
- Use `page.tsx` for route components and `layout.tsx` for shared layouts

### 2. Component Organization
- Place UI components in `components/ui/` using shadcn/ui patterns
- Group feature components by domain: `components/auth/`, `components/polls/`, `components/dashboard/`
- Use PascalCase for component files: `LoginForm.tsx`, `CreatePollForm.tsx`
- Export components as named exports, not default exports
- Keep components focused and single-responsibility

### 3. Supabase Integration Patterns
- Use separate client configurations: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (middleware)
- Always handle Supabase errors with proper error messages and toast notifications
- Use Row Level Security (RLS) policies for all database operations
- Implement proper session management with automatic refresh
- Use TypeScript interfaces for all Supabase data types

## 🔐 Authentication & Security

### 4. Authentication Flow
- Use Supabase Auth for all user authentication
- Implement protected routes with `ProtectedRoute` component wrapper
- Use middleware for automatic route protection and session refresh
- Store user state in React Context (`contexts/auth-context.tsx`)
- Always validate user permissions before database operations

### 5. Form Handling & Validation
- Use controlled components with React state for form inputs
- Implement client-side validation with proper error messages
- Use toast notifications (Sonner) for user feedback
- Handle loading states during form submission
- Validate passwords match on registration forms

## 🎨 UI/UX Patterns

### 6. Component Styling
- Use Tailwind CSS with shadcn/ui component library
- Follow consistent spacing: `space-y-4`, `gap-4`, `p-4`, `m-4`
- Use semantic color classes: `text-primary`, `bg-background`, `border-border`
- Implement responsive design with mobile-first approach
- Use consistent button variants: `default`, `outline`, `ghost`, `destructive`

### 7. Loading & Error States
- Show loading spinners during async operations
- Use skeleton loaders for content that takes time to load
- Display user-friendly error messages with toast notifications
- Implement proper fallback UI for error states
- Use consistent loading patterns across all components

## 📊 Data Management

### 8. Database Schema Conventions
- Use UUID primary keys for all tables
- Include `created_at` and `updated_at` timestamps
- Use snake_case for database column names
- Implement proper foreign key relationships with CASCADE deletes
- Use boolean flags for status fields: `is_active`, `is_public`

### 9. API Design Patterns
- Use RESTful conventions for API routes
- Return consistent response format: `{ success, data, error, message }`
- Implement proper HTTP status codes
- Use TypeScript interfaces for request/response types
- Handle errors gracefully with meaningful messages

## 🔧 Development Practices

### 10. TypeScript Usage
- Use strict TypeScript configuration
- Define interfaces for all data structures in `lib/types/`
- Use proper type annotations for function parameters and return types
- Avoid `any` type - use proper typing or `unknown`
- Export types from dedicated type files

### 11. File Naming Conventions
- Use kebab-case for folders: `create-poll-form/`
- Use PascalCase for component files: `LoginForm.tsx`
- Use camelCase for utility files: `authUtils.ts`
- Use descriptive names that indicate purpose
- Group related files in appropriate directories

### 12. Code Organization
- Keep components under 200 lines when possible
- Extract reusable logic into custom hooks
- Use proper import organization: external libraries first, then internal imports
- Implement proper error boundaries for React components
- Use consistent code formatting with Prettier

## 🚀 Performance & Optimization

### 13. Next.js Optimization
- Use Next.js Image component for optimized images
- Implement proper loading strategies for components
- Use dynamic imports for code splitting
- Optimize bundle size by avoiding unnecessary dependencies
- Use proper caching strategies for API responses

### 14. State Management
- Use React Context for global state (authentication)
- Use local state for component-specific data
- Avoid prop drilling by using context appropriately
- Implement proper state updates with immutable patterns
- Use React.memo for expensive components when needed

## 🧪 Testing & Quality

### 15. Code Quality Standards
- Write self-documenting code with clear variable and function names
- Add JSDoc comments for complex functions
- Use consistent error handling patterns
- Implement proper logging for debugging
- Follow accessibility guidelines (WCAG 2.1)

---

## 📝 Usage Examples

### Creating a New Protected Page
```tsx
'use client'
import { ProtectedRoute } from '@/components/protected-route'
import { Navigation } from '@/components/navigation'

export default function NewPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        {/* Page content */}
      </div>
    </ProtectedRoute>
  )
}
```

### Using Supabase in Components
```tsx
'use client'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export function MyComponent() {
  const { user, signOut } = useAuth()
  
  const handleAction = async () => {
    try {
      // Supabase operation
      toast.success('Operation successful!')
    } catch (error) {
      toast.error('Operation failed')
    }
  }
}
```

### Form Pattern
```tsx
'use client'
import { useState } from 'react'
import { toast } from 'sonner'

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({})
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Form submission logic
      toast.success('Success!')
    } catch (error) {
      toast.error('Error occurred')
    } finally {
      setIsLoading(false)
    }
  }
}
```
