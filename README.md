# BU-Learn

AI-powered gamified mobile learning platform built with Expo and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (for mobile testing)

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GEMINI_API_KEY` (for AI features)

3. **Start development server**
```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web
- Scan QR code with Expo Go app

## 📁 Project Structure

```
BU-LEARN/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── (auth)/            # Auth screens (login/signup)
│   └── learn/             # Learning session screens
├── components/            # Reusable UI components
├── lib/                   # Core logic
│   ├── supabase.ts       # Supabase client
│   ├── gamification.ts   # XP/badge logic
│   └── mockData.ts       # Mock data for testing
├── types/                 # TypeScript types
├── constants/            # Theme, colors, config
└── assets/               # Images, fonts, etc.
```

## 🎨 Tech Stack

- **Frontend:** Expo (React Native), TypeScript
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **AI:** Google Gemini API

## 📚 Features

- 📝 Upload study materials (PDF, text)
- 🤖 AI converts to 4 formats: Notes, Audio, Quiz, Story
- 🎮 Gamification: XP, levels, badges, streaks
- 📊 Leaderboards and challenges
- 👥 Community features (Premium)

## 🛠️ Development

### Phase 1: MVP (Current)
- [x] Project setup
- [ ] Auth flow
- [ ] File upload
- [ ] Mock conversions
- [ ] Basic UI

### Next Steps
See `OVERVIEW.md` for full development plan.

## 📄 License

MIT
