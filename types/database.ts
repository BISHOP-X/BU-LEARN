// Database types matching Supabase schema

export type LearningStyle = 'visual' | 'auditory' | 'reading' | 'kinesthetic'

export type ContentStatus = 'uploaded' | 'processing' | 'completed' | 'error'

export type ConversionFormat = 'notes' | 'audio' | 'quiz' | 'story'

export interface User {
  id: string
  email: string
  username: string
  learning_style: LearningStyle
  points: number
  level: number
  streak: number
  created_at: string
}

export interface Content {
  id: string
  user_id: string
  title: string
  file_url: string
  file_type: string
  status: ContentStatus
  created_at: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation?: string
}

export interface AudioData {
  url: string
  duration: number
  script: string
}

export interface ConvertedOutput {
  id: string
  content_id: string
  format: ConversionFormat
  data: {
    notes?: string
    audio?: AudioData
    quiz?: QuizQuestion[]
    story?: string
  }
  created_at: string
}

export interface QuizResult {
  id: string
  user_id: string
  quiz_id: string
  score: number
  completed_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_type: string
  earned_at: string
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  points: number
  level: number
  rank: number
}
