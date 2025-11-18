# BU-Learn Architecture

## How the System Works

BU-Learn is a mobile learning app built with **Expo (React Native)** on the frontend and **Supabase** on the backend. Students upload documents, AI converts them into 4 learning formats, and gamification keeps them engaged. Here's how everything fits together.

---

## System Flow

```
1. User uploads PDF/TXT → Stored in Supabase Storage
2. File metadata saved → content table
3. AI processing triggered → Google Gemini API
4. Generated content saved → generated_content table
5. User views Notes/Quiz/Story/Audio → Reads from generated_content
6. Progress tracked → user_progress table
7. Achievements unlocked → user_badges table
```

---

## Tech Stack

```
Mobile App (Expo/React Native)
    ├── Navigation: Expo Router (file-based routing)
    ├── State: React Hooks + AsyncStorage (local caching)
    ├── UI: Custom components + react-native-reanimated (animations)
    ├── Haptics: expo-haptics (tactile feedback)
    └── Auth: Supabase Auth SDK

Backend (Supabase)
    ├── Database: PostgreSQL (7 tables)
    ├── Storage: File bucket for uploads
    ├── Auth: Email/password + social login
    └── Edge Functions: AI processing (Google Gemini)

AI Layer
    ├── Google Gemini API: Content generation
    └── Google Cloud TTS: Text-to-speech audio

Gamification Layer
    ├── XP System: Points calculation, level progression
    ├── Badge System: Achievement tracking, unlock logic
    ├── Streak System: Daily engagement tracking with calendar
    └── Leaderboard: Real-time rankings with podium display
```

---

## Database Schema

### Core Tables

**1. users** - User profiles with gamification
```
id, username, learning_style, points, level, streak, last_active
```
Used by: Profile screen, Leaderboard, Badge system

**2. content** - Uploaded files
```
id, user_id, title, file_url, file_type, file_size, status, created_at
```
Used by: Library screen, Upload flow

**3. generated_content** - AI-generated learning materials
```
id, content_id, user_id,
notes_summary, notes_key_points, notes_detailed,
quiz_questions, quiz_total_questions, quiz_passing_score,
story_chapters, story_total_chapters, story_reading_time,
audio_url, audio_duration, audio_transcript,
generation_status
```
Used by: Result screen (Notes/Quiz/Story/Audio tabs)

**4. quiz_attempts** - Quiz performance tracking
```
id, user_id, generated_content_id, score, total_questions, answers, time_taken
```
Used by: Quiz results, Leaderboard, Badge achievements

**5. user_progress** - Reading/listening state
```
id, user_id, generated_content_id,
current_chapter, bookmarked_chapters,
audio_position, playback_speed,
notes_view
```
Used by: Story tab (chapter position), Audio tab (playback resume), Notes tab (view preference)

### Gamification Tables

**6. badges** - Badge definitions
```
id, name, description, icon, requirement, category, points_reward
```
Seeded with 20 badges: upload milestones, perfect quizzes, streaks, achievements

**7. user_badges** - User earned badges
```
id, user_id, badge_id, earned_at
```
Trigger: Auto-awards points to `users.points` when badge earned

---

## App Structure

```
app/
├── index.tsx                    # Splash screen (checks auth)
├── onboarding.tsx               # First-time user intro slides
├── (auth)/
│   ├── login.tsx                # Email/password login
│   └── signup.tsx               # Account creation + learning style quiz
├── (tabs)/                      # Main app (bottom tabs)
│   ├── index.tsx                # Home dashboard (progress, recommendations, XP/streak)
│   ├── library.tsx              # Uploaded content list (with filters/search)
│   ├── leaderboard.tsx          # Top users by points with podium display
│   └── profile.tsx              # User profile + badges + animated XP bar
├── upload.tsx                   # File picker → Supabase Storage
├── badges.tsx                   # Badge collection screen (filters, details)
└── result/[id].tsx              # Content viewer (4 tabs: Notes/Quiz/Story/Audio)

components/
├── result/
│   ├── NotesTab.tsx             # Shows summary/detailed notes
│   ├── QuizTab.tsx              # MCQ quiz with scoring
│   ├── StoryTab.tsx             # Chapter-based narrative reader
│   └── AudioTab.tsx             # Audio player with speed control
├── BadgeUnlockModal.tsx         # Animated badge unlock notification
├── LevelUpModal.tsx             # Level progression celebration
├── XPToast.tsx                  # XP gain notification toast
├── StreakWarningToast.tsx       # Streak risk alert
├── StreakCalendar.tsx           # Visual streak history (30 days)
├── SkeletonLoader.tsx           # Loading placeholders
└── Toast.tsx                    # General notification toasts

lib/
├── supabase.ts                  # Supabase client initialization
├── mockData.ts                  # Sample data for development
├── xpSystem.ts                  # XP calculation, level progression logic
├── badgeSystem.ts               # Badge requirements, unlock logic
├── streakSystem.ts              # Streak tracking, calendar generation
└── gamification.ts              # Unified gamification utilities

hooks/
├── useXPSystem.ts               # XP/level state management
├── useBadgeNotifications.ts     # Badge unlock tracking
└── useStreakWarning.ts          # Streak risk monitoring
```

---

## Key Workflows

### 1. Upload → AI Processing Flow

```
User selects file
    ↓
upload.tsx validates file (PDF/TXT, <10MB)
    ↓
Upload to Supabase Storage (bucket: content-files)
    ↓
Insert into content table (status: 'uploaded')
    ↓
Trigger Supabase Edge Function (AI processing)
    ↓
Edge Function:
    1. Extract text from file
    2. Call Google Gemini API for:
       - Notes generation (summary + key points + detailed)
       - Quiz generation (10 MCQ questions)
       - Story generation (5 narrative chapters)
    3. Generate audio via Google Cloud TTS
    4. Upload audio to Storage
    5. Save all to generated_content table (status: 'completed')
    ↓
Update content.status → 'completed'
    ↓
User sees content in Library with "Ready" badge
```

### 2. Viewing Content Flow

```
User taps content card in Library
    ↓
Navigate to result/[id].tsx
    ↓
Fetch from generated_content table (JOIN with content)
    ↓
Load user_progress for this content (resume position)
    ↓
Display 4 tabs:
    - Notes: Show summary or detailed (toggle saved to user_progress)
    - Quiz: MCQ with immediate feedback, save attempt to quiz_attempts
    - Story: Chapter reader with bookmarks (saved to user_progress)
    - Audio: Player with seek/speed controls (position saved to user_progress)
```

### 3. Gamification Flow

```
User completes action (upload, quiz, streak)
    ↓
Frontend calls lib/xpSystem.ts → awardXP(userId, amount, reason)
    ↓
XP added to users.points in database
    ↓
Check if level up triggered (every 500 XP = +1 level)
    ↓
If level up:
    1. Update users.level
    2. Show LevelUpModal with confetti animation
    3. Trigger haptic feedback (Success notification)
    ↓
Check badge requirements via lib/badgeSystem.ts
    ↓
If badge earned:
    1. Insert into user_badges
    2. Award badge.points_reward
    3. Show BadgeUnlockModal with badge details
    4. Trigger haptic feedback (Medium impact)
    5. Display XPToast with points gained
    ↓
Update leaderboard rankings (ORDER BY points DESC)
    ↓
Streak system checks daily engagement:
    - If 23+ hours since last_active → Show StreakWarningToast
    - If >24 hours → Reset streak to 0
    - If active today → Increment streak, show StreakCalendar
```

---

## Data Flow Patterns

### Real-time vs Cached

**Real-time (Direct Supabase queries):**
- Library screen: Fetch latest content on mount + pull-to-refresh
- Leaderboard: Always fetch fresh rankings
- Profile: Fetch current user stats

**Cached (AsyncStorage):**
- Notes view preference: Stored locally per content
- Quiz progress: Auto-save current question on each answer
- Story bookmarks: Persist across app restarts
- Audio position: Save on pause/seek

**Why this hybrid?** Fast UX (instant local saves) + data sync (cloud backup)

---

## Security & Performance

### Row Level Security (RLS)

```sql
-- Users can only see their own content
content: user_id = auth.uid()

-- Users can only see their own generated content
generated_content: user_id = auth.uid()

-- Users can only see their own progress
user_progress: user_id = auth.uid()

-- Leaderboard is public (read-only)
users: SELECT allowed for all
```

### Optimization Strategies

1. **Indexes**: All foreign keys indexed (user_id, content_id, etc.)
2. **Pagination**: Leaderboard loads top 100 only
3. **Lazy Loading**: Audio doesn't load until Audio tab opened
4. **Skeleton Loaders**: Show placeholders while fetching (better UX than spinners)
5. **Debounced Search**: Library search waits 300ms after typing stops

---

## AI Integration Details

### Content Generation Pipeline

**Input:** Raw text extracted from PDF/TXT file

**Google Gemini Prompts:**

1. **Notes Generation**
```
"Generate comprehensive study notes from this text:
- Summary: 2-3 sentences
- Key Points: 10-15 bullet points
- Detailed Notes: Full markdown with sections, examples, definitions"
```

2. **Quiz Generation**
```
"Create 10 multiple choice questions covering this material:
- 3 easy, 4 medium, 3 hard
- 4 options each
- Include explanation for correct answer"
```

3. **Story Generation**
```
"Convert this educational content into an engaging narrative story:
- 5 chapters
- Use storytelling techniques (characters, conflict, resolution)
- Maintain educational accuracy"
```

4. **Audio Generation**
- Take detailed notes text → Google Cloud TTS
- Voice: en-US-Standard-A (female) or B (male)
- Speed: 1.0x default, adjustable in app (0.5x - 2.0x)

---

## State Management

### Local State (React Hooks)

```typescript
// Each screen manages its own state
const [content, setContent] = useState<ContentItem[]>([]);
const [loading, setLoading] = useState(false);
const [searchQuery, setSearchQuery] = useState('');

// Gamification hooks
const { 
  xpToastVisible, 
  xpGained, 
  hideXPToast,
  levelUpModalVisible,
  newLevel,
  closeLevelUpModal
} = useXPSystem(userId);

const { showWarning, currentStreak, hideWarning } = useStreakWarning(userId);
const { badges, checkAndUnlockBadges } = useBadgeNotifications(userId);
```

### Persistent State (AsyncStorage)

```typescript
// Notes tab view preference
AsyncStorage.setItem('@notes_view_preference', 'detailed');

// Quiz progress (per quiz)
AsyncStorage.setItem(`@quiz_progress_${quizId}`, JSON.stringify({
  currentQuestion: 3,
  answers: {q1: 0, q2: 2, q3: 1},
  score: 2
}));
```

### Global Context (Auth)

```typescript
// Auth state shared across app
const AuthContext = React.createContext();

// Provides: user, session, signIn(), signOut()
```

---

## Error Handling

### Upload Errors
- File too large → Show toast "Max 10MB"
- Unsupported format → Show toast "PDF/TXT only"
- Network error → Retry with exponential backoff

### AI Processing Errors
- Generation fails → Set content.status = 'error'
- Show retry button in Library
- Error logged to generated_content.error_message

### Auth Errors
- Session expired → Redirect to login
- Invalid credentials → Show inline error message

---

## Future Scaling Considerations

### When to Add Backend Server?

Currently using Supabase Edge Functions (serverless). Consider Node.js server if:
- Processing time exceeds 10 minutes (Edge Function timeout)
- Need complex job queues (multiple retries, priority scheduling)
- Heavy computation (Gemini API rate limits)

### Database Optimization

- **Partitioning**: Split `quiz_attempts` by month if >10M rows
- **Archival**: Move old content to cold storage after 1 year
- **Caching**: Add Redis for leaderboard if >100K active users

### Cost Optimization

- **Google Gemini**: ~$0.01 per file conversion (watch token usage)
- **Google Cloud TTS**: ~$4 per 1M characters (cache audio, don't regenerate)
- **Supabase Storage**: Free tier = 1GB, then $0.021/GB

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Upload Success Rate**: % of files successfully processed
2. **AI Generation Time**: Avg seconds from upload → completion
3. **Quiz Completion Rate**: % of started quizzes finished
4. **User Retention**: Day 1, Day 7, Day 30 active users
5. **Badge Unlock Rate**: Which badges are earned most
6. **Streak Engagement**: % of users maintaining 7+ day streaks
7. **XP Distribution**: Average XP per user, daily active users
8. **Leaderboard Activity**: Top 10% user XP growth rate
9. **Haptic Feedback Usage**: Interaction rate with gamified elements

### Error Logging

```typescript
// Log to Supabase or external service
try {
  await processFile(file);
} catch (error) {
  await supabase.from('error_logs').insert({
    user_id: user.id,
    error_type: 'ai_generation_failed',
    error_message: error.message,
    context: { fileId: file.id }
  });
}
```

---

## Development vs Production

### Environment Variables

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyxxx...

# Production uses different Supabase project
# Never commit API keys to git
```

### Build Configurations

```json
// app.json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "xxx-xxx-xxx"
      }
    }
  }
}
```

---

## Summary

BU-Learn uses a clean 3-tier architecture with integrated gamification:

1. **Presentation Layer** (Expo/React Native)
   - 14+ screens with bottom tab + stack navigation
   - Custom animated components (react-native-reanimated)
   - Haptic feedback integration (expo-haptics)
   - Local state caching for instant UX
   - Real-time gamification UI (modals, toasts, progress bars)

2. **Business Logic Layer** (Supabase Edge Functions + Client-side Logic)
   - File processing + AI generation
   - Badge achievement checks (client-side via badgeSystem.ts)
   - Streak calculation (client-side via streakSystem.ts)
   - XP/level progression (client-side via xpSystem.ts)

3. **Data Layer** (PostgreSQL + Storage)
   - 7 tables with RLS security
   - Indexed foreign keys
   - Auto-triggers for gamification (badge points award)

**Why this works:** Fast development, low infrastructure costs, scales to 10K+ users without major changes. Gamification logic runs client-side for instant feedback, with database sync for persistence. When you hit 100K+ users, consider adding dedicated backend servers and job queues.

**New in Current Build:**
- ✅ Complete gamification system (XP, levels, badges, streaks)
- ✅ Leaderboard with animated podium display
- ✅ Haptic feedback for enhanced UX
- ✅ Real-time notifications (badge unlocks, level ups, streak warnings)
- ✅ Custom hooks for gamification state management
- ⏳ AI integration (Phase 8 - pending implementation)
