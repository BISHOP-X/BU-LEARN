import { shouldShowStreakWarning } from '@/lib/streakSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'streak_warning_shown_date';

/**
 * Hook to manage streak warning notification
 * Shows warning once per day if streak is at risk
 */
export function useStreakWarning(userId: string | null) {
  const [showWarning, setShowWarning] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (userId) {
      checkStreakWarning(userId);
    }
  }, [userId]);

  const checkStreakWarning = async (userId: string) => {
    try {
      // Check if already shown today
      const today = new Date().toDateString();
      const lastShownDate = await AsyncStorage.getItem(STORAGE_KEY);

      if (lastShownDate === today) {
        // Already shown today, don't show again
        return;
      }

      // Check if streak is at risk
      const isAtRisk = await shouldShowStreakWarning(userId);

      if (isAtRisk) {
        // Get user's current streak from database
        const { supabase } = await import('@/lib/supabase');
        const { data: user } = await supabase
          .from('users')
          .select('streak')
          .eq('id', userId)
          .single();

        if (user?.streak) {
          setCurrentStreak(user.streak);
          setShowWarning(true);

          // Mark as shown for today
          await AsyncStorage.setItem(STORAGE_KEY, today);
        }
      }
    } catch (error) {
      console.error('Error checking streak warning:', error);
    }
  };

  const hideWarning = () => {
    setShowWarning(false);
  };

  return {
    showWarning,
    currentStreak,
    hideWarning,
  };
}
