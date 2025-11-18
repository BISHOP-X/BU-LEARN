import { supabase } from './supabase';

/**
 * Streak System
 * Manages user learning streaks with daily check-ins, calendar tracking, and reset logic
 */

export interface StreakDay {
  date: string; // YYYY-MM-DD format
  isActive: boolean;
  dayOfWeek: string; // Mon, Tue, Wed, etc.
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date1 is yesterday compared to date2
 */
function isYesterday(date1: Date, date2: Date): boolean {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
}

/**
 * Get the number of days between two dates
 */
function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffMs = date2.getTime() - date1.getTime();
  return Math.floor(diffMs / oneDay);
}

/**
 * Update user streak based on last active date
 * - If last active was yesterday: increment streak
 * - If last active was today: no change
 * - If last active was 2+ days ago: reset streak to 1
 */
export async function updateStreak(userId: string): Promise<{
  success: boolean;
  streak: number;
  wasReset: boolean;
  error?: string;
}> {
  try {
    // Fetch current user data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('streak, last_active')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastActive = user.last_active ? new Date(user.last_active) : null;
    let newStreak = user.streak || 0;
    let wasReset = false;

    if (!lastActive) {
      // First time user - start streak at 1
      newStreak = 1;
    } else if (isSameDay(lastActive, now)) {
      // Already checked in today - no change
      return {
        success: true,
        streak: newStreak,
        wasReset: false,
      };
    } else if (isYesterday(lastActive, now)) {
      // Checked in yesterday - increment streak
      newStreak += 1;
    } else {
      // Missed 2+ days - reset streak
      const daysMissed = getDaysBetween(lastActive, now);
      if (daysMissed >= 2) {
        newStreak = 1;
        wasReset = true;
      }
    }

    // Update database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak: newStreak,
        last_active: now.toISOString(),
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return {
      success: true,
      streak: newStreak,
      wasReset,
    };
  } catch (error) {
    console.error('Error updating streak:', error);
    return {
      success: false,
      streak: 0,
      wasReset: false,
      error: error instanceof Error ? error.message : 'Failed to update streak',
    };
  }
}

/**
 * Get streak calendar for the last 7 days
 * Shows which days the user was active
 */
export async function getStreakCalendar(userId: string): Promise<StreakDay[]> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('last_active, streak')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const calendar: StreakDay[] = [];
    const now = new Date();
    const lastActive = user?.last_active ? new Date(user.last_active) : null;
    const streak = user?.streak || 0;

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Determine if this day was active
      let isActive = false;
      if (lastActive) {
        const daysDiff = getDaysBetween(date, now);
        // If the date is within the current streak range, mark as active
        if (daysDiff < streak) {
          isActive = true;
        } else if (isSameDay(date, lastActive)) {
          isActive = true;
        }
      }

      calendar.push({
        date: dateStr,
        isActive,
        dayOfWeek,
      });
    }

    return calendar;
  } catch (error) {
    console.error('Error fetching streak calendar:', error);
    return [];
  }
}

/**
 * Check if user should see a streak warning
 * Returns true if last active was yesterday (streak at risk)
 */
export async function shouldShowStreakWarning(userId: string): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('last_active, streak')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!user?.last_active || !user?.streak) return false;

    const now = new Date();
    const lastActive = new Date(user.last_active);

    // Show warning if last active was yesterday (today is the last day to maintain streak)
    return isYesterday(lastActive, now) && !isSameDay(lastActive, now);
  } catch (error) {
    console.error('Error checking streak warning:', error);
    return false;
  }
}

/**
 * Get streak stats for display
 */
export async function getStreakStats(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isAtRisk: boolean;
}> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('streak, last_active')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const currentStreak = user?.streak || 0;
    const isAtRisk = await shouldShowStreakWarning(userId);

    // TODO: Add longest_streak column to users table in future
    // For now, longest streak = current streak
    const longestStreak = currentStreak;

    return {
      currentStreak,
      longestStreak,
      isAtRisk,
    };
  } catch (error) {
    console.error('Error fetching streak stats:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      isAtRisk: false,
    };
  }
}
