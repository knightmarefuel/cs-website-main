# Vitamin F3 Community Fitness Portal - PRD

## Original Problem Statement
Continue an existing Next.js (App Router) + Supabase project for a "Vitamin F3 Community Fitness Portal". The project was deployed on Vercel with working Auth + onboarding. Task: Premium UI/UX upgrade with plain CSS only (no Tailwind), plus "best value" features including role-based navigation, booking UX improvements, payment proof submission, and micro-polish.

## Architecture
- **Frontend**: Next.js 15.1 (App Router), React 19, Plain CSS
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Deployment**: Vercel
- **Design**: Dark theme (#0A0A0A) with Gold accent (#D4AF37)

## User Personas
1. **Client**: Books fitness sessions, submits payment proofs
2. **Trainer**: Views assigned sessions (inherited from admin view)
3. **Admin**: Manages communities, class types, sessions, reviews payments

## Core Requirements (Static)
- ✅ Plain CSS only (no Tailwind/shadcn)
- ✅ Mobile-first responsive design
- ✅ Vercel build must pass
- ✅ Node.js 20 (.nvmrc)
- ✅ ESLint ignored during builds

---

## What's Been Implemented (Jan 2026)

### UI/UX Upgrade
- [x] Premium dark theme with CSS custom properties
- [x] Gold accent color system (#D4AF37)
- [x] Responsive mobile-first design
- [x] App shell with sticky nav + footer
- [x] Feature cards with hover effects
- [x] Modern form styling with focus states
- [x] Table design with hover highlights
- [x] Badge system (success/warning/danger/info/gold)
- [x] Button variants (primary/danger/success/solid)
- [x] Skeleton loading components
- [x] Empty state components
- [x] Toast notification system

### Pages Updated
- [x] Homepage (marketing landing)
- [x] Sign-in page (centered auth card)
- [x] Sign-up page (centered auth card)
- [x] Onboarding page (profile creation form)
- [x] Dashboard (sessions, bookings, payments tabs)
- [x] Admin landing page (4-card navigation)
- [x] Admin Communities CRUD
- [x] Admin Class Types CRUD
- [x] Admin Sessions CRUD
- [x] Admin Payments (NEW - review/approve/reject)

### Features Implemented
- [x] A) Role-based navigation (client/trainer/admin links)
- [x] A) Auth guards (redirect to sign-in, admin-only pages)
- [x] B) Session filters (date range: today/week/all, class type)
- [x] B) Capacity display with remaining spots
- [x] B) Book session with full detection
- [x] B) Double-booking prevention (unique constraint handling)
- [x] C) Payment submission form with file upload
- [x] C) Upload progress indicator
- [x] C) My Submissions list with status badges
- [x] C) Admin payment review modal (approve/reject + notes)
- [x] D) Toast notifications
- [x] D) Skeleton loading states
- [x] D) Empty state illustrations

### Components Created
- `/components/Nav.tsx` - Role-aware navigation
- `/components/AppShell.tsx` - Layout wrapper
- `/components/Toast.tsx` - Toast provider + UI
- `/components/Skeleton.tsx` - Loading skeletons
- `/components/EmptyState.tsx` - Empty state UI

### Database Migrations Provided
- `MIGRATIONS.md` - SQL for bookings, payment_submissions, leads tables + RLS policies

---

## Prioritized Backlog

### P0 (Critical) - None

### P1 (High Priority)
- [ ] Run SQL migrations in Supabase for full functionality
- [ ] Create `payment-proofs` storage bucket with policies
- [ ] Test full booking flow with real data

### P2 (Medium Priority)
- [ ] Add booking cancellation confirmation modal
- [ ] Add session edit from admin page
- [ ] Show trainer name on session cards
- [ ] Export bookings/payments to CSV

### P3 (Nice to Have)
- [ ] Dark/light theme toggle
- [ ] Email notifications for booking confirmation
- [ ] SMS reminders via Twilio
- [ ] Analytics dashboard for admin

---

## Next Tasks
1. Deploy to Vercel and verify build
2. Run MIGRATIONS.md SQL in Supabase SQL Editor
3. Create payment-proofs storage bucket
4. Test with real admin user
5. Add additional polish based on user feedback
