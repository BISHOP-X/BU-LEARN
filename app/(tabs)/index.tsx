import BadgeUnlockModal from '@/components/BadgeUnlockModal';
import LevelUpModal from '@/components/LevelUpModal';
import StreakWarningToast from '@/components/StreakWarningToast';
import XPToast from '@/components/XPToast';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useBadgeNotifications } from '@/hooks/useBadgeNotifications';
import { useStreakWarning } from '@/hooks/useStreakWarning';
import { useXPSystem } from '@/hooks/useXPSystem';
import { calculateLevel, calculateProgress } from '@/lib/gamification';
import { updateStreak } from '@/lib/streakSystem';
import { supabase } from '@/lib/supabase';
import { awardDailyLoginXP } from '@/lib/xpSystem';
import type { User } from '@/types/database';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentBadge, modalVisible, handleCloseModal, checkForNewBadges } = useBadgeNotifications(user?.id || null);
  const { 
    xpToastVisible, 
    xpAmount, 
    hideXPToast, 
    levelUpModalVisible, 
    levelUpData, 
    closeLevelUpModal, 
    handleXPAwarded 
  } = useXPSystem();
  const { showWarning, currentStreak, hideWarning } = useStreakWarning(user?.id || null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    // Check for badges and daily login XP when user data is loaded
    if (user?.id) {
      checkDailyLogin();
      checkForNewBadges();
    }
  }, [user?.id]);

  const checkDailyLogin = async () => {
    if (!user?.id) return;
    
    // Update streak (checks last_active, increments if yesterday, resets if 2+ days)
    const streakResult = await updateStreak(user.id);
    if (streakResult.success) {
      // Update local user state with new streak
      setUser(prev => prev ? { ...prev, streak: streakResult.streak } : null);
      
      // Check if streak was reset (user missed 2+ days)
      if (streakResult.wasReset) {
        console.log('Streak was reset to 1 after missing days');
      }
    }
    
    // Award daily login XP
    const xpResult = await awardDailyLoginXP(user.id);
    if (xpResult.success) {
      handleXPAwarded(xpResult);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) throw error;
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Error loading user data</Text>
      </View>
    );
  }

  const level = calculateLevel(user.points);
  const progress = calculateProgress(user.points);

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.usernameText}>{user.username}! 👋</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.streak}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% to Level {level + 1}
          </Text>
        </View>
      </View>

      {/* Quick Upload Button */}
      <TouchableOpacity 
        style={styles.uploadButton} 
        activeOpacity={0.8}
        onPress={() => router.push('/upload')}
      >
        <View style={styles.uploadButtonContent}>
          <Text style={styles.uploadIcon}>📤</Text>
          <View>
            <Text style={styles.uploadButtonText}>Upload New Material</Text>
            <Text style={styles.uploadButtonSubtext}>Convert to 4 learning formats</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Empty State for now */}
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No content yet</Text>
        <Text style={styles.emptySubtitle}>
          Upload your first document to start learning
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>

    {/* Badge Unlock Modal */}
    <BadgeUnlockModal
      visible={modalVisible}
      badge={currentBadge}
      onClose={handleCloseModal}
    />

    {/* Level Up Modal */}
    <LevelUpModal
      visible={levelUpModalVisible}
      oldLevel={levelUpData.oldLevel}
      newLevel={levelUpData.newLevel}
      onClose={closeLevelUpModal}
    />

    {/* XP Toast */}
    <XPToast
      visible={xpToastVisible}
      xpAmount={xpAmount}
      onHide={hideXPToast}
    />

    {/* Streak Warning Toast */}
    <StreakWarningToast
      visible={showWarning}
      streak={currentStreak}
      onHide={hideWarning}
      onActionPress={() => router.push('/upload' as any)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
  },
  welcomeText: {
    fontSize: Typography.body,
    color: '#666',
  },
  usernameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  uploadButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
