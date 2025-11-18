import { supabase } from './supabase';

export type BadgeCategory = 'upload' | 'quiz' | 'streak' | 'achievement' | 'social';

interface BadgeRequirement {
  id: string;
  category: BadgeCategory;
  checkCondition: (stats: UserStats) => boolean;
}

interface UserStats {
  uploadCount: number;
  perfectQuizCount: number;
  currentStreak: number;
  totalQuizzes: number;
  level: number;
}

/**
 * Checks if a user has earned any new badges based on their current stats
 * @param userId - The user's ID
 * @returns Array of newly earned badge IDs
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  try {
    // Fetch all badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('sort_order', { ascending: true });

    if (badgesError) throw badgesError;

    // Fetch user's already earned badges
    const { data: earnedBadges, error: earnedError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (earnedError) throw earnedError;

    const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);

    // Fetch user stats
    const stats = await getUserStats(userId);

    // Check each unearned badge
    const newlyEarnedBadges: string[] = [];

    for (const badge of allBadges || []) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const earned = checkBadgeRequirement(badge, stats);
      
      if (earned) {
        // Award the badge
        const { error: insertError } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
          });

        if (!insertError) {
          newlyEarnedBadges.push(badge.id);
        }
      }
    }

    return newlyEarnedBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

/**
 * Gets the user's current stats for badge checking
 */
async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('streak, level')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get upload count
    const { count: uploadCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get perfect quiz count
    const { count: perfectQuizCount } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('percentage', 100);

    // Get total quiz count
    const { count: totalQuizzes } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      uploadCount: uploadCount || 0,
      perfectQuizCount: perfectQuizCount || 0,
      totalQuizzes: totalQuizzes || 0,
      currentStreak: userData?.streak || 0,
      level: userData?.level || 1,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      uploadCount: 0,
      perfectQuizCount: 0,
      totalQuizzes: 0,
      currentStreak: 0,
      level: 1,
    };
  }
}

/**
 * Checks if a specific badge requirement is met
 */
function checkBadgeRequirement(badge: any, stats: UserStats): boolean {
  const requirement = badge.requirement.toLowerCase();

  // Upload badges
  if (badge.category === 'upload') {
    if (requirement.includes('first') || requirement.includes('1')) {
      return stats.uploadCount >= 1;
    }
    const match = requirement.match(/\d+/);
    if (match) {
      const required = parseInt(match[0]);
      return stats.uploadCount >= required;
    }
  }

  // Quiz badges
  if (badge.category === 'quiz') {
    if (requirement.includes('first quiz')) {
      return stats.totalQuizzes >= 1;
    }
    if (requirement.includes('perfect')) {
      const match = requirement.match(/\d+/);
      if (match) {
        const required = parseInt(match[0]);
        return stats.perfectQuizCount >= required;
      }
      return stats.perfectQuizCount >= 1;
    }
  }

  // Streak badges
  if (badge.category === 'streak') {
    const match = requirement.match(/\d+/);
    if (match) {
      const required = parseInt(match[0]);
      return stats.currentStreak >= required;
    }
  }

  // Achievement badges
  if (badge.category === 'achievement') {
    if (requirement.includes('level 5')) {
      return stats.level >= 5;
    }
    if (requirement.includes('level 10')) {
      return stats.level >= 10;
    }
  }

  return false;
}

/**
 * Gets details of specific badges by their IDs
 */
export async function getBadgeDetails(badgeIds: string[]) {
  if (badgeIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .in('id', badgeIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badge details:', error);
    return [];
  }
}
