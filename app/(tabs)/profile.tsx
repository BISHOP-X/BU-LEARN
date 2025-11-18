import StreakCalendar from '@/components/StreakCalendar';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, Animated as RNAnimated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type UserStats = {
  totalUploads: number;
  totalBadges: number;
  earnedBadges: number;
  recentBadges: Array<{
    id: string;
    name: string;
    icon: string;
    earned_at: string;
  }>;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [stats, setStats] = useState<UserStats>({
    totalUploads: 0,
    totalBadges: 0,
    earnedBadges: 0,
    recentBadges: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const progressAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setEmail(authUser.email || '');
        
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userError) throw userError;
        setUser(userData);

        // Fetch user stats
        await fetchStats(authUser.id);

        // Animate XP progress bar
        const progress = getXPProgress();
        RNAnimated.timing(progressAnim, {
          toValue: progress,
          duration: 800,
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (userId: string) => {
    try {
      // Fetch total uploads
      const { count: uploadsCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Fetch total badges available
      const { count: totalBadgesCount } = await supabase
        .from('badges')
        .select('*', { count: 'exact', head: true });

      // Fetch earned badges
      const { data: earnedBadgesData, count: earnedCount } = await supabase
        .from('user_badges')
        .select(`
          id,
          badge_id,
          earned_at,
          badges (
            id,
            name,
            icon
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(3);

      const recentBadges = earnedBadgesData?.map(badge => ({
        id: badge.badge_id,
        name: (badge.badges as any)?.name || '',
        icon: (badge.badges as any)?.icon || '🏆',
        earned_at: badge.earned_at
      })) || [];

      setStats({
        totalUploads: uploadsCount || 0,
        totalBadges: totalBadgesCount || 20, // Default to 20 if query fails
        earnedBadges: earnedCount || 0,
        recentBadges
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleStreakUpdate = (newStreak: number) => {
    // Update local user state with new streak
    if (user) {
      setUser({ ...user, streak: newStreak });
    }
  };

  const getAvatarColor = (username: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getXPProgress = () => {
    const currentLevel = user?.level || 1;
    const currentXP = user?.points || 0;
    const xpForCurrentLevel = (currentLevel - 1) * 500;
    const xpForNextLevel = currentLevel * 500;
    const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getXPToNextLevel = () => {
    const currentLevel = user?.level || 1;
    const currentXP = user?.points || 0;
    const xpForNextLevel = currentLevel * 500;
    return Math.max(xpForNextLevel - currentXP, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSignOut = async () => {
    await AsyncStorage.clear();
    await supabase.auth.signOut();
    router.replace('/onboarding');
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
        <Text>Error loading profile</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <Animated.View style={styles.header} entering={FadeInUp.duration(500)}>
        <Text style={styles.title}>Profile</Text>
      </Animated.View>

      <View style={styles.content}>
        {/* Profile Header Card */}
        <Animated.View style={styles.profileCard} entering={FadeInDown.duration(500).delay(100)}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(user.username) }]}>
            <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
          </View>
          
          <Text style={styles.name}>{user.username}</Text>
          <Text style={styles.email}>{email}</Text>

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color={Colors.warning} />
            <Text style={styles.levelText}>Level {user.level}</Text>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpContainer}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>{user.points?.toLocaleString()} XP</Text>
              <Text style={styles.xpNext}>{getXPToNextLevel()} to Level {(user.level || 1) + 1}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <RNAnimated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={styles.statsGrid} entering={FadeInDown.duration(500).delay(200)}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="flash" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{user.points?.toLocaleString() || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
              <Text style={styles.statIconText}>🔥</Text>
            </View>
            <Text style={styles.statValue}>{user.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="book" size={24} color="#4ECDC4" />
            </View>
            <Text style={styles.statValue}>{stats.totalUploads}</Text>
            <Text style={styles.statLabel}>Uploads</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Ionicons name="trophy" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.earnedBadges}/{stats.totalBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </Animated.View>

        {/* Streak Tracker */}
        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <StreakCalendar userId={user.id} onStreakUpdate={handleStreakUpdate} />
        </Animated.View>

        {/* Mini Badge Showcase */}
        {stats.recentBadges.length > 0 && (
          <Animated.View style={styles.badgesSection} entering={FadeInDown.duration(500).delay(300)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Badges</Text>
              <TouchableOpacity onPress={() => router.push('/badges' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.badgesGrid}>
              {stats.recentBadges.map((badge, index) => (
                <AnimatedTouchable
                  key={badge.id}
                  style={styles.badgeMini}
                  entering={FadeInDown.duration(400).delay(350 + index * 50)}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/badges' as any);
                  }}
                >
                  <Text style={styles.badgeMiniIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeMiniName} numberOfLines={1}>{badge.name}</Text>
                  <Text style={styles.badgeMiniDate}>{formatDate(badge.earned_at)}</Text>
                </AnimatedTouchable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Learning Profile Section */}
        <Animated.View style={styles.section} entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionTitle}>Learning Profile</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="school" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Learning Style</Text>
            </View>
            <Text style={styles.infoValue}>{user.learning_style || 'Not set'}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Member Since</Text>
            </View>
            <Text style={styles.infoValue}>{new Date(user.created_at || '').toLocaleDateString()}</Text>
          </View>
        </Animated.View>

        {/* Settings Section */}
        <Animated.View style={styles.section} entering={FadeInDown.duration(500).delay(500)}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="person-circle-outline" size={22} color={Colors.text} />
              <Text style={styles.menuText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="color-palette-outline" size={22} color={Colors.text} />
              <Text style={styles.menuText}>Change Learning Style</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={22} color={Colors.text} />
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.text} />
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </Animated.View>

        <AnimatedTouchable 
          style={styles.signOutButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            handleSignOut();
          }}
          entering={FadeInDown.duration(500).delay(600)}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </AnimatedTouchable>
      </View>
    </ScrollView>
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
    padding: Spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  content: {
    padding: Spacing.xl,
  },
  // Profile Card
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  name: {
    fontSize: Typography.h2,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: Typography.body,
    color: '#666',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 4,
  },
  // XP Progress
  xpContainer: {
    width: '100%',
    marginTop: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  xpNext: {
    fontSize: 12,
    color: '#666',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  // Badges Section
  badgesSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeMini: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: 12,
    alignItems: 'center',
  },
  badgeMiniIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeMiniName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeMiniDate: {
    fontSize: 10,
    color: '#666',
  },
  // Sections
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: Typography.body,
    color: Colors.text,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  // Menu
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: Typography.body,
    color: Colors.text,
    marginLeft: 12,
  },
  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  signOutText: {
    color: Colors.white,
    fontSize: Typography.h4,
    fontWeight: '600',
    marginLeft: 8,
  },
});
