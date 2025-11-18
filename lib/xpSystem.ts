import { supabase } from './supabase';

export const XP_REWARDS = {
  UPLOAD: 50,
  QUIZ_BASE: 50,
  QUIZ_PERFECT: 150,
  STORY_CHAPTER: 40,
  AUDIO_COMPLETE: 30,
  DAILY_LOGIN: 10,
} as const;

export const XP_PER_LEVEL = 500;

/**
 * Calculates the current level based on total XP
 */
export function calculateLevel(points: number): number {
  return Math.floor(points / XP_PER_LEVEL) + 1;
}

/**
 * Calculates XP progress within current level (0-100%)
 */
export function calculateLevelProgress(points: number): number {
  const currentLevelXP = points % XP_PER_LEVEL;
  return Math.round((currentLevelXP / XP_PER_LEVEL) * 100);
}

/**
 * Calculates XP needed for next level
 */
export function calculateXPToNextLevel(points: number): number {
  const currentLevel = calculateLevel(points);
  const nextLevelXP = currentLevel * XP_PER_LEVEL;
  return Math.max(nextLevelXP - points, 0);
}

/**
 * Awards XP to a user and updates their level
 * @returns Object containing new points, old level, new level, and leveledUp flag
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  reason?: string
): Promise<{
  success: boolean;
  newPoints: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  error?: string;
}> {
  try {
    // Get current user data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('points, level')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const oldPoints = userData?.points || 0;
    const oldLevel = userData?.level || 1;
    const newPoints = oldPoints + xpAmount;
    const newLevel = calculateLevel(newPoints);
    const leveledUp = newLevel > oldLevel;

    // Update user points and level
    const { error: updateError } = await supabase
      .from('users')
      .update({
        points: newPoints,
        level: newLevel,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log(`✨ Awarded ${xpAmount} XP to user ${userId}${reason ? ` (${reason})` : ''}`);
    if (leveledUp) {
      console.log(`🎉 Level up! ${oldLevel} → ${newLevel}`);
    }

    return {
      success: true,
      newPoints,
      oldLevel,
      newLevel,
      leveledUp,
    };
  } catch (error: any) {
    console.error('Error awarding XP:', error);
    return {
      success: false,
      newPoints: 0,
      oldLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: error.message,
    };
  }
}

/**
 * Award XP for uploading content
 */
export async function awardUploadXP(userId: string) {
  return awardXP(userId, XP_REWARDS.UPLOAD, 'Content Upload');
}

/**
 * Award XP for completing a quiz
 * @param score - Quiz score (0-100)
 */
export async function awardQuizXP(userId: string, score: number) {
  let xpAmount: number;
  
  if (score === 100) {
    xpAmount = XP_REWARDS.QUIZ_PERFECT;
  } else {
    // Scale XP based on score: 50-150 range
    xpAmount = Math.round(XP_REWARDS.QUIZ_BASE + (score / 100) * (XP_REWARDS.QUIZ_PERFECT - XP_REWARDS.QUIZ_BASE));
  }

  return awardXP(userId, xpAmount, `Quiz Completed (${score}%)`);
}

/**
 * Award XP for completing a story chapter
 */
export async function awardStoryChapterXP(userId: string) {
  return awardXP(userId, XP_REWARDS.STORY_CHAPTER, 'Story Chapter Completed');
}

/**
 * Award XP for completing audio content
 */
export async function awardAudioXP(userId: string) {
  return awardXP(userId, XP_REWARDS.AUDIO_COMPLETE, 'Audio Completed');
}

/**
 * Award XP for daily login
 */
export async function awardDailyLoginXP(userId: string) {
  try {
    // Check if user has already logged in today
    const { data: userData } = await supabase
      .from('users')
      .select('last_active')
      .eq('id', userId)
      .single();

    const lastActive = userData?.last_active ? new Date(userData.last_active) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      if (lastActive.getTime() === today.getTime()) {
        // Already logged in today
        return {
          success: false,
          newPoints: 0,
          oldLevel: 1,
          newLevel: 1,
          leveledUp: false,
          error: 'Already logged in today',
        };
      }
    }

    // Update last_active
    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', userId);

    return awardXP(userId, XP_REWARDS.DAILY_LOGIN, 'Daily Login');
  } catch (error: any) {
    console.error('Error awarding daily login XP:', error);
    return {
      success: false,
      newPoints: 0,
      oldLevel: 1,
      newLevel: 1,
      leveledUp: false,
      error: error.message,
    };
  }
}
