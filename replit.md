# İnsan Fizik Tedavi ve Rehabilitasyon Merkezi

## Overview

This is a modern, SEO-optimized, mobile-responsive website for İnsan Fizik Tedavi ve Rehabilitasyon Merkezi (İnsan Physical Therapy and Rehabilitation Center), a healthcare facility located in Büyükçekmece, Istanbul. The website provides information about physical therapy services, allows patients to book appointments, contact the center, and read educational blog content about various treatments.

The application is built as a full-stack web application with a React frontend and Express backend, designed to facilitate patient engagement through multiple communication channels (phone, WhatsApp, contact forms, and appointment booking).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### November 4, 2025 - Admin Panel Refactor and Appointment Management Enhancement

**Admin Navigation Improvement**:
- Refactored admin panel from header-based navigation to sidebar-based navigation using Shadcn sidebar primitives
- Created `AdminSidebar` component with collapsible menu system
- Created `AdminLayout` wrapper component for consistent admin page layouts
- All admin pages now use the unified sidebar navigation system

**Appointment Management Features**:
- Enhanced AdminAppointments page with therapist assignment functionality
- Added ability to assign physiotherapists to appointments via dropdown selection
- Implemented appointment status management (Pending, Confirmed, Completed, Cancelled)
- Added real-time appointment updates with automatic cache invalidation

**Backend Enhancements**:
- Added `PATCH /api/appointments/:id` endpoint (admin-only) for updating appointments
- Added `GET /api/users/therapists` endpoint (admin-only) for fetching physiotherapist list
- Implemented `updateAppointment` method in storage layer (both MemStorage and DatabaseStorage)
- Enhanced security with `requireAdmin` middleware protecting sensitive endpoints

**Bug Fixes**:
- Fixed logout functionality in AdminSidebar (corrected apiRequest parameter order)
- Fixed AdminLayout and SEO component imports (named exports)

**Testing**:
- Added comprehensive end-to-end test coverage for admin appointment management workflow
- Validated therapist assignment, status updates, and logout functionality

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, chosen for its lightweight nature compared to React Router.

**UI Component Library**: Shadcn UI (New York style variant) built on Radix UI primitives, providing accessible, customizable components with Tailwind CSS styling.

**Styling Approach**: 
- Tailwind CSS for utility-first styling
- Custom design system based on healthcare aesthetics with specific color palette (light blue #3cb3d9, white #ffffff, dark navy #0e2240)
- Poppins font family loaded via Google Fonts CDN
- Design guidelines documented in `design_guidelines.md` emphasizing trust, accessibility, and professional healthcare appearance

**State Management**: 
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Hook Form with Zod validation for form state and validation
- Local component state with React hooks

**Pages Structure**:
- Home: Hero section, services preview, testimonials, contact information
- Services: Detailed descriptions of 6 core services (Physical Therapy, Manual Therapy, Orthopedic Rehabilitation, Scoliosis Treatment, Hernia Treatment, Neurological Rehabilitation)
- About: Mission, vision, team experience, clinic information
- Team: Physiotherapist profiles with credentials
- Blog: Educational content about treatments and exercises
- Contact: Contact form, location map, contact details
- Appointment: Booking form with service selection, date/time slots

### Backend Architecture

**Framework**: Express.js with TypeScript, running on Node.js.

**Server Structure**:
- Monolithic Express server handling both API routes and static file serving
- Vite integration for development with HMR (Hot Module Replacement)
- Production build serves static React assets alongside API endpoints

**API Design**:
- RESTful endpoints under `/api` prefix
- POST `/api/appointments` - Create appointment bookings
- GET `/api/appointments` - Retrieve all appointments
- POST `/api/contact` - Submit contact messages
- GET `/api/contact` - Retrieve all contact messages

**Data Validation**: 
- Zod schemas for runtime type validation
- Schema definitions shared between client and server via `shared/schema.ts`
- Drizzle-Zod integration for generating validation schemas from database schema

**Error Handling**: 
- Centralized error handling with appropriate HTTP status codes
- Zod validation errors converted to user-friendly messages using zod-validation-error

### Data Storage Solutions

**Database**: PostgreSQL via Neon serverless driver (@neondatabase/serverless).

**ORM**: Drizzle ORM chosen for:
- Type-safe database queries
- Lightweight compared to heavier ORMs
- Excellent TypeScript integration
- Simple schema definition and migrations

**Schema Design**:
- `appointments` table: Stores patient appointment requests with service, date, time, contact info
- `contact_messages` table: Stores general contact form submissions
- Both tables use UUID primary keys generated by PostgreSQL
- Timestamps track creation time

**Development Storage**: In-memory storage implementation (`MemStorage`) allows development without database connection, implementing the same interface as the database storage layer.

**Migration Strategy**: Drizzle Kit for schema migrations, configured to use PostgreSQL dialect with migration files in `/migrations` directory.

### External Dependencies

**Third-Party UI Libraries**:
- Radix UI: Unstyled, accessible component primitives for building the UI component library
- Lucide React: Icon library for consistent iconography
- Embla Carousel: Carousel/slider functionality
- CMDK: Command menu component

**Forms and Validation**:
- React Hook Form: Form state management and validation
- Zod: Schema validation library
- @hookform/resolvers: Integration between React Hook Form and Zod

**Styling**:
- Tailwind CSS: Utility-first CSS framework
- class-variance-authority: Managing component variants
- clsx & tailwind-merge: Utility for merging Tailwind classes

**SEO and Meta Tags**:
- react-helmet-async: Managing document head for SEO optimization
- Configured with Turkish language meta tags, OpenGraph tags, structured data

**Communication Integrations**:
- WhatsApp Business API: Direct link to wa.me/905326127244 for instant messaging
- Phone: Direct dial link to 0532 612 72 44
- Google Maps: Embedded iframe for location display (Mimaroba Mah., Büyükçekmece, Istanbul)

**Database Services**:
- Neon: Serverless PostgreSQL hosting
- Connection pooling handled by Neon's serverless driver

**Build and Development Tools**:
- TypeScript: Type safety across the entire stack
- ESBuild: Fast JavaScript bundler for server-side code
- Vite: Frontend build tool and dev server
- TSX: TypeScript execution for development
- Drizzle Kit: Database schema management and migrations

**Replit-Specific Integrations**:
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Code navigation
- @replit/vite-plugin-dev-banner: Development environment indicator

**Font Delivery**: Google Fonts CDN for Poppins, Architects Daughter, DM Sans, Fira Code, and Geist Mono font families.