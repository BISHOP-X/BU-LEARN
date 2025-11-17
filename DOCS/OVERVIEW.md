# BU-Learn - Simplified Project Plan

## 1. What We're Building

**BU-Learn** is an AI-powered mobile learning app where students upload study materials (PDFs, text) and get 4 learning formats:
- 📝 **Notes** (summaries)
- 🎧 **Audio** (text-to-speech)
- ❓ **Quizzes** (generated questions)
- 📖 **Stories** (narrative-based learning)

Plus gamification: XP, badges, streaks, leaderboards.

**GitHub:** `https://github.com/Ryanv20/BU-Learn`

---

## 2. Tech Stack (Simple)

```
Frontend: Expo (React Native)
Backend: Supabase
    ├── Auth (login/signup)
    ├── PostgreSQL (database)
    ├── Storage (file uploads)
    └── Edge Functions (AI conversion logic)
AI: Google Gemini API
```

**Why this works:**
- No separate Node.js servers needed
- Supabase handles auth, database, storage, serverless functions
- Direct integration with Expo
- Fast to prototype

---

## 3. Design & UI

### Color Palette
- **Primary:** Deep Blue `#2A2F7B`
- **Secondary:** Cyan `#00C2FF`
- **Accent:** Lime `#A7FF00`
- **Background:** Off-white `#F5F7FA`
- **Text:** Charcoal `#212121`

### Key Screens (13 total)

1. **Splash Screen** → Logo + loading
2. **Onboarding** → 3-4 intro slides
3. **Auth** → Login/Signup (with learning style quiz)
4. **Home Dashboard** → Progress, recommendations, quick upload button
5. **Upload** → Drag/drop files, select output types
6. **Conversion Result** → Tabs showing all 4 formats
7. **Library** → Saved materials
8. **Learning Sessions:**
   - Quiz (MCQ with timer)
   - Story Mode (narrative chapters)
   - Audio Player (controls + speed)
9. **Leaderboard** → Rankings + challenges
10. **Community** (Premium) → Chat, friend battles, challenges
11. **Profile** → Stats, badges, settings
12. **Settings** → Preferences, notifications
13. **Admin Dashboard** (Web) → Analytics, moderation

### Navigation Flow
```
Splash → Onboarding → Auth → Dashboard
                              ├── Upload → Result → Library → Learning
                              ├── Leaderboard
                              ├── Community (Premium)
                              └── Profile → Settings
```

---

## 4. Database Schema (Supabase/PostgreSQL)

**users**
```sql
id              UUID PRIMARY KEY
email           VARCHAR
username        VARCHAR
learning_style  VARCHAR  -- visual, auditory, reading, kinesthetic
points          INTEGER DEFAULT 0
level           INTEGER DEFAULT 1
streak          INTEGER DEFAULT 0
created_at      TIMESTAMP
```

**content**
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
title       VARCHAR
file_url    TEXT  -- Supabase Storage URL
file_type   VARCHAR  -- pdf, txt, docx
status      VARCHAR  -- uploaded, processing, completed, error
created_at  TIMESTAMP
```

**converted_outputs**
```sql
id          UUID PRIMARY KEY
content_id  UUID REFERENCES content(id)
format      VARCHAR  -- notes, audio, quiz, story
data        JSONB    -- the actual converted content
created_at  TIMESTAMP
```

**quiz_results**
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
quiz_id     UUID
score       INTEGER
completed_at TIMESTAMP
```

**badges**
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
badge_type  VARCHAR  -- first_quiz, 10_streak, top_10, etc.
earned_at   TIMESTAMP
```

---

## 5. API / Edge Functions

**Supabase Edge Functions (Deno):**

### `convert-content`
```typescript
// Triggered when file uploaded
// Calls Gemini API to generate all 4 formats
POST /functions/v1/convert-content
Body: { contentId: string }
Returns: { notes, audio, quiz, story }
```

### `calculate-points`
```typescript
// Updates user points after activity
POST /functions/v1/calculate-points
Body: { userId: string, action: string, metadata: object }
```

### `update-leaderboard`
```typescript
// Recalculates rankings (can run on schedule)
POST /functions/v1/update-leaderboard
```

---

## 6. AI Conversion Logic

**Input:** PDF/text file from Supabase Storage

**Gemini API Prompts:**

1. **Notes:** "Summarize this content into key bullet points for studying"
2. **Audio Script:** "Convert this to a natural spoken script for text-to-speech"
3. **Quiz:** "Generate 10 multiple choice questions with 4 options each"
4. **Story:** "Transform this material into an engaging narrative story"

**Output Format:**
```json
{
  "notes": "• Key point 1\n• Key point 2...",
  "audio": "url-to-generated-audio.mp3",
  "quiz": [
    {
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }
  ],
  "story": "Chapter 1: Once upon a time..."
}
```

**Mock Data (Phase 1):**
Start with hardcoded responses to test UI, then swap in real Gemini calls.

---

## 7. Gamification Rules

| Action | XP Earned |
|--------|-----------|
| Upload content | +10 |
| Complete quiz | +50 |
| Finish audio lesson | +30 |
| Read notes | +20 |
| Complete story chapter | +40 |
| Daily login | +5 |
| 7-day streak | +100 bonus |

**Levels:** Every 500 XP = Level up

**Badges:**
- 🎯 First Quiz (complete 1 quiz)
- 🔥 Week Warrior (7-day streak)
- 📚 Knowledge Seeker (10 uploads)
- 👑 Top 10 (reach leaderboard top 10)

---

## 8. Folder Structure

### Expo App Structure
```
bu-learn-app/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── index.tsx          # Home/Dashboard
│   │   ├── library.tsx
│   │   ├── leaderboard.tsx
│   │   ├── community.tsx      # Premium
│   │   └── profile.tsx
│   ├── upload.tsx
│   ├── result/[id].tsx
│   └── learn/
│       ├── quiz/[id].tsx
│       ├── audio/[id].tsx
│       └── story/[id].tsx
├── components/
│   ├── Card.tsx
│   ├── ProgressBar.tsx
│   ├── BadgeIcon.tsx
│   └── UploadButton.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── gemini.ts             # AI conversion helpers
│   └── gamification.ts       # XP/badge logic
└── constants/
    └── theme.ts              # Colors, fonts
```

---

## 9. Team Roles (Simplified)

| Role | Responsibility | Person |
|------|----------------|--------|
| **Team Lead** | Architecture, coordination | Davies |
| **UI/UX Designer** | Figma → Expo components | Emeka |
| **Frontend Dev 1** | Auth, navigation setup | Charis |
| **Frontend Dev 2** | Home, upload, library screens | Olive |
| **Frontend Dev 3** | Learning sessions (quiz/audio/story) | Iklaki |
| **Backend Dev 1** | Supabase setup, schema, auth | Pascal |
| **Backend Dev 2** | AI conversion Edge Function | Wisdom |
| **Backend Dev 3** | Gamification logic, leaderboard | Jibrin |
| **Backend Dev 4** | Premium features, community | Ilipeju |
| **Database** | Schema optimization, migrations | Ifeoma |
| **QA/Compliance** | Testing, rule enforcement | Ryan, Davies |

---

## 10. Development Phases

### Phase 1: MVP (Weeks 1-2)
- ✅ Expo app scaffold with navigation
- ✅ Supabase project setup (auth + database)
- ✅ Basic auth flow (login/signup)
- ✅ Upload file to Supabase Storage
- ✅ **Mock AI conversions** (hardcoded responses)
- ✅ Display all 4 formats
- ✅ Basic gamification (XP tracking)

### Phase 2: AI Integration (Week 3)
- ✅ Supabase Edge Function calling Gemini API
- ✅ Real conversions (notes, quiz generation)
- ✅ Text-to-speech for audio
- ✅ Error handling & retry logic

### Phase 3: Gamification (Week 4)
- ✅ Leaderboard with rankings
- ✅ Badge system
- ✅ Streak tracking
- ✅ Daily challenges

### Phase 4: Polish (Week 5)
- ✅ Premium features (community, chat)
- ✅ Admin dashboard
- ✅ Performance optimization
- ✅ Testing & bug fixes

---

## 11. Getting Started

### 1. Create Expo App
```bash
npx create-expo-app bu-learn-app --template tabs
cd bu-learn-app
```

### 2. Install Dependencies
```bash
npx expo install @supabase/supabase-js
npx expo install expo-document-picker
npx expo install @react-navigation/native
```

### 3. Set Up Supabase
- Create project at supabase.com
- Copy API keys to `.env`
- Run database migrations (schema from section 4)

### 4. Configure Supabase Client
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 5. Start Development
```bash
npx expo start
```

---

## 12. Key Differences from Original Doc

| Original | Simplified | Why |
|----------|------------|-----|
| Node.js microservices | Supabase Edge Functions | Less infrastructure |
| Separate event system | PostgreSQL triggers | Built-in database features |
| Multiple backend servers | Single Supabase project | Easier to manage |
| Complex API gateway | Direct Supabase client | Faster development |
| Kafka/RabbitMQ events | Database + Realtime | No extra services needed |

**Bottom line:** Everything runs on Expo + Supabase. No separate servers, no deployment complexity, fast prototyping.

---

## 13. Next Steps

1. **Right Now:** Set up Expo project
2. **Today:** Configure Supabase, create tables
3. **This Week:** Build auth flow + file upload
4. **Next Week:** Implement mock conversions + basic UI
5. **Week 3:** Integrate real Gemini API
6. **Week 4+:** Gamification + polish

---

*Cleaned and simplified from the original overengineered version. This is the actionable prototype plan.*
