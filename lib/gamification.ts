// Gamification logic and XP calculations

export const XP_REWARDS = {
  UPLOAD_CONTENT: 10,
  COMPLETE_QUIZ: 50,
  FINISH_AUDIO: 30,
  READ_NOTES: 20,
  COMPLETE_STORY: 40,
  DAILY_LOGIN: 5,
  WEEK_STREAK_BONUS: 100,
}

export const XP_PER_LEVEL = 500

export function calculateLevel(points: number): number {
  return Math.floor(points / XP_PER_LEVEL) + 1
}

export function getXpForNextLevel(points: number): number {
  const currentLevel = calculateLevel(points)
  return currentLevel * XP_PER_LEVEL - points
}

export function calculateProgress(points: number): number {
  const currentLevelPoints = points % XP_PER_LEVEL
  return (currentLevelPoints / XP_PER_LEVEL) * 100
}

export type BadgeType = 
  | 'first_quiz'
  | '7_day_streak'
  | '10_uploads'
  | 'top_10'
  | 'week_warrior'
  | 'knowledge_seeker'

export const BADGE_INFO: Record<BadgeType, { title: string; description: string; icon: string }> = {
  first_quiz: {
    title: 'First Quiz',
    description: 'Completed your first quiz',
    icon: '🎯'
  },
  '7_day_streak': {
    title: 'Week Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥'
  },
  '10_uploads': {
    title: 'Knowledge Seeker',
    description: 'Uploaded 10 learning materials',
    icon: '📚'
  },
  top_10: {
    title: 'Top 10',
    description: 'Reached top 10 on the leaderboard',
    icon: '👑'
  },
  week_warrior: {
    title: 'Week Warrior',
    description: '7-day streak maintained',
    icon: '🔥'
  },
  knowledge_seeker: {
    title: 'Knowledge Seeker',
    description: '10 materials uploaded',
    icon: '📚'
  }
}
