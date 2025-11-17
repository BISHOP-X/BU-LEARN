BU-Learn Implementation Plan
Phase 1: Foundation & Onboarding (Week 1)
Frontend:

Splash screen with logo animation
Onboarding slides (3 screens with swiper)
Sign up screen with learning style quiz
Login screen
Basic navigation setup
Backend (Supabase):

Create Supabase project
Set up authentication (email/password)
Create users table with learning style field
Test auth flow
Deliverable: User can sign up, pick learning style, and log in

Phase 2: Home Dashboard & Profile (Week 1-2)
Frontend:

Home dashboard showing XP/level/streak
Profile screen showing user stats
Basic settings screen
Backend:

Add gamification fields to users table (points, level, streak)
Create RPC functions for fetching user stats
Set up real-time subscriptions for live updates
Deliverable: User sees their personalized dashboard after login

Phase 3: File Upload & Storage (Week 2)
Frontend:

Upload screen with file picker
File preview/metadata input (title, subject)
Progress indicator during upload
Backend:

Set up Supabase Storage bucket for files
Create content table (id, user_id, title, file_url, status)
Create RPC function to handle upload metadata
Set up Row Level Security (RLS) policies
Deliverable: User can upload PDF/text files to their account

Phase 4: Mock AI Conversion (Week 2-3)
Frontend:

Conversion result screen with 4 tabs (Notes/Audio/Quiz/Story)
Notes reader with markdown support
Quiz interface with MCQ and scoring
Story reader
Simple audio player placeholder
Backend:

Create converted_outputs table
Create mock Edge Function that returns hardcoded conversions
Trigger conversion on file upload
Store mock results in database
Deliverable: User uploads file, sees mock converted content in all 4 formats

Phase 5: Real AI Integration (Week 3)
Frontend:

Same screens, just connected to real data
Backend:

Set up Gemini API key in Supabase secrets
Create Edge Function convert-content:
Extract text from PDF/file
Call Gemini API for notes (summarization)
Call Gemini API for quiz (question generation)
Call Gemini API for story (narrative transformation)
Generate audio script
Call Text-to-Speech API (Google TTS or ElevenLabs)
Store all outputs in converted_outputs table
Deliverable: Real AI converts uploaded files into all 4 formats

Phase 6: Learning Sessions & XP System (Week 3-4)
Frontend:

Quiz session with timer and progress
Audio player with controls (play/pause/speed)
Completion tracking
XP animation when earned
Backend:

Create quiz_results table
Create calculate-points Edge Function
Award XP based on actions (upload, quiz complete, etc.)
Update user points/level/streak
Database triggers for automatic XP calculation
Deliverable: User completes learning sessions and earns XP

Phase 7: Library & Content Management (Week 4)
Frontend:

Library screen showing all uploads
Filters (by format, date, subject)
Search functionality
Delete/edit content
Backend:

Add pagination for content queries
Add search/filter functions
Implement soft delete with RLS
Deliverable: User can browse and manage their learning library

Phase 8: Gamification Features (Week 4-5)
Frontend:

Leaderboard screen with rankings
Badge display system
Streak tracker with calendar
Achievement notifications
Backend:

Create badges table
Create update-leaderboard Edge Function
Set up Supabase Realtime for live leaderboard
Create badge awarding logic (database functions)
Schedule daily streak checks
Deliverable: Full gamification with leaderboards, badges, streaks

Phase 9: Polish & Testing (Week 5)
Frontend:

Loading states and error handling
Offline support basics
Animations and transitions
Responsive design fixes
Backend:

Error logging and monitoring
Rate limiting on Edge Functions
Database indexes for performance
Backup strategies
Deliverable: Production-ready MVP

Phase 10: Premium Features (Optional - Week 6+)
Frontend:

Community feed
Chat system
Friend challenges
Premium upgrade flow
Backend:

**Paystack** payment integration (Nigerian payments)
Premium user flags
Chat infrastructure (Supabase Realtime)
Challenge system
What We Build Per Phase:
Phase	Frontend Screens	Backend Setup	Time
1	Splash, Onboarding, Auth	Supabase Auth + users table	3-4 days
2	Dashboard, Profile	Gamification schema	2-3 days
3	Upload screen	Storage + content table	2-3 days
4	Result tabs (4 formats)	Mock conversion function	3-4 days
5	(Same UI)	Real Gemini integration	4-5 days
6	Learning sessions	XP calculation logic	3-4 days
7	Library screen	Queries + filters	2-3 days
8	Leaderboard, badges	Realtime + triggers	3-4 days
9	Polish	Optimization	3-4 days
Total: ~4-5 weeks for full MVP

