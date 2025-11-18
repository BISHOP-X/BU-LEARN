import { Colors, Spacing, Typography } from '@/constants/theme';
import { mockLeaderboard } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  username: string;
  points: number;
  level: number;
  streak: number;
};

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard.map(entry => ({
    rank: entry.rank,
    user_id: entry.userId,
    username: entry.username,
    points: entry.points,
    level: entry.level,
    streak: entry.streak || 0
  })));
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch top 100 users
      const { data, error } = await supabase
        .from('users')
        .select('id, username, points, level, streak')
        .order('points', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        // Add rank numbers
        const rankedData = data.map((user, index) => ({
          rank: index + 1,
          user_id: user.id,
          username: user.username,
          points: user.points || 0,
          level: user.level || 1,
          streak: user.streak || 0
        }));
        setLeaderboard(rankedData);

        // Find current user in leaderboard
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userEntry = rankedData.find(entry => entry.user_id === user.id);
          if (userEntry) {
            setCurrentUser(userEntry);
          } else {
            // User not in top 100, fetch their rank separately
            const { count } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .gt('points', 0);
            
            const { data: userData } = await supabase
              .from('users')
              .select('id, username, points, level, streak')
              .eq('id', user.id)
              .single();

            if (userData) {
              setCurrentUser({
                rank: (count || 0) + 1,
                user_id: userData.id,
                username: userData.username,
                points: userData.points || 0,
                level: userData.level || 1,
                streak: userData.streak || 0
              });
            }
          }
        }
      } else {
        // Use mock data if database is empty
        setLeaderboard(mockLeaderboard.map(entry => ({
          rank: entry.rank,
          user_id: entry.userId,
          username: entry.username,
          points: entry.points,
          level: entry.level,
          streak: entry.streak || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fallback to mock data
      setLeaderboard(mockLeaderboard.map(entry => ({
        rank: entry.rank,
        user_id: entry.userId,
        username: entry.username,
        points: entry.points,
        level: entry.level,
        streak: entry.streak || 0
      })));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const getAvatarColor = (username: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString();
  };

  const isCurrentUser = (userId: string) => {
    return currentUser?.user_id === userId;
  };

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);
    if (topThree.length === 0) return null;

    // Arrange as: 2nd, 1st, 3rd
    const arranged = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

    return (
      <Animated.View style={styles.podiumContainer} entering={FadeInUp.duration(600)}>
        {arranged.map((entry, index) => {
          const actualRank = entry.rank;
          const height = actualRank === 1 ? 140 : actualRank === 2 ? 110 : 90;
          
          return (
            <Animated.View 
              key={entry.user_id}
              style={[styles.podiumCard, { height }]}
              entering={FadeInDown.duration(500).delay(index * 100)}
            >
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(entry.username) }]}>
                <Text style={styles.avatarText}>{entry.username[0].toUpperCase()}</Text>
              </View>
              <Text style={styles.medal}>{getMedalIcon(actualRank)}</Text>
              <Text style={styles.podiumName} numberOfLines={1}>{entry.username}</Text>
              <Text style={styles.podiumPoints}>{formatPoints(entry.points)} XP</Text>
              <View style={styles.podiumLevel}>
                <Ionicons name="star" size={12} color={Colors.warning} />
                <Text style={styles.podiumLevelText}>Lv {entry.level}</Text>
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };

  const renderRankingItem = (entry: LeaderboardEntry, index: number) => {
    const isUser = isCurrentUser(entry.user_id);
    
    return (
      <AnimatedTouchable
        key={entry.user_id}
        style={[styles.rankingCard, isUser && styles.currentUserCard]}
        entering={FadeInDown.duration(400).delay(Math.min(index * 50, 500))}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankNumber}>#{entry.rank}</Text>
        </View>

        <View style={[styles.avatar, styles.avatarSmall, { backgroundColor: getAvatarColor(entry.username) }]}>
          <Text style={styles.avatarTextSmall}>{entry.username[0].toUpperCase()}</Text>
        </View>

        <View style={styles.rankingInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.rankingName, isUser && styles.currentUserName]} numberOfLines={1}>
              {entry.username}
            </Text>
            {isUser && <Text style={styles.youBadge}>YOU</Text>}
          </View>
          <View style={styles.rankingStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.statText}>Lv {entry.level}</Text>
            </View>
            {entry.streak > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.statText}>{entry.streak} days</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={[styles.rankingPoints, isUser && styles.currentUserPoints]}>
            {formatPoints(entry.points)}
          </Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </AnimatedTouchable>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={styles.header} entering={FadeInUp.duration(500)}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top learners this month</Text>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>⏳</Text>
            <Text style={styles.emptyTitle}>Loading...</Text>
          </View>
        ) : leaderboard.length > 0 ? (
          <>
            {renderTopThree()}

            <View style={styles.rankingsSection}>
              <Text style={styles.sectionTitle}>All Rankings</Text>
              {leaderboard.slice(3).map((entry, index) => renderRankingItem(entry, index))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🏆</Text>
            <Text style={styles.emptyTitle}>No Rankings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to earn points and top the leaderboard!
            </Text>
          </View>
        )}
      </ScrollView>

      {currentUser && !loading && (
        <Animated.View 
          style={styles.currentUserFooter}
          entering={FadeInUp.duration(600).delay(300)}
        >
          <View style={styles.footerRank}>
            <Text style={styles.footerRankNumber}>#{currentUser.rank}</Text>
          </View>
          <View style={[styles.avatar, styles.avatarSmall, { backgroundColor: getAvatarColor(currentUser.username) }]}>
            <Text style={styles.avatarTextSmall}>{currentUser.username[0].toUpperCase()}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Text style={styles.footerName}>{currentUser.username}</Text>
            <Text style={styles.footerStats}>Level {currentUser.level}</Text>
          </View>
          <View style={styles.footerPoints}>
            <Text style={styles.footerPointsValue}>{formatPoints(currentUser.points)}</Text>
            <Text style={styles.footerPointsLabel}>XP</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.h2,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Podium styles
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  podiumCard: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
    justifyContent: 'space-evenly',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarTextSmall: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
  },
  medal: {
    fontSize: 30,
    marginVertical: 4,
  },
  podiumName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  podiumPoints: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  podiumLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  podiumLevelText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: Colors.warning,
  },

  // Rankings styles
  rankingsSection: {
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  currentUserCard: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rankNumber: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  rankingInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
    flexWrap: 'nowrap',
  },
  rankingName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    flex: 1,
    flexShrink: 1,
    maxWidth: '70%',
  },
  currentUserName: {
    color: Colors.primary,
  },
  youBadge: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rankingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
  },
  streakIcon: {
    fontSize: 12,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  rankingPoints: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  currentUserPoints: {
    color: Colors.primary,
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
  },

  // Current user footer
  currentUserFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  footerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  footerRankNumber: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
  },
  footerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  footerName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    marginBottom: 2,
  },
  footerStats: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.white + 'CC',
  },
  footerPoints: {
    alignItems: 'flex-end',
  },
  footerPointsValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
  },
  footerPointsLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: Colors.white + 'CC',
  },
});
