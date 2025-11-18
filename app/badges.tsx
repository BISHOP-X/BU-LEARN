import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type FilterType = 'all' | 'earned' | 'locked' | 'upload' | 'quiz' | 'streak' | 'achievement' | 'social';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  category: string;
  points_reward: number;
  sort_order: number;
  earned_at?: string;
  progress?: number;
  total?: number;
}

export default function BadgesScreen() {
  const [userId, setUserId] = useState<string>('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getUserAndFetchBadges();
  }, []);

  const getUserAndFetchBadges = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await fetchBadges(session.user.id);
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setLoading(false);
    }
  };

  const fetchBadges = async (currentUserId: string) => {
    try {
      setLoading(true);

      // Fetch all badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('sort_order', { ascending: true });

      if (badgesError) throw badgesError;

      // Fetch user's earned badges
      const { data: earnedBadges, error: earnedError } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', currentUserId);

      if (earnedError) throw earnedError;

      // Fetch user stats for progress calculation
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('streak')
        .eq('id', currentUserId)
        .single();

      if (userError) throw userError;

      const { count: uploadCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId);

      const { count: perfectQuizCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('percentage', 100);

      // Merge data
      const earnedBadgeIds = new Set(earnedBadges?.map(b => b.badge_id) || []);
      const earnedBadgesMap = new Map(earnedBadges?.map(b => [b.badge_id, b.earned_at]) || []);

      const mergedBadges = allBadges?.map(badge => {
        const earned = earnedBadgeIds.has(badge.id);
        let progress = 0;
        let total = 0;

        if (!earned) {
          // Calculate progress for locked badges
          if (badge.category === 'upload') {
            const match = badge.requirement.match(/\d+/);
            total = match ? parseInt(match[0]) : 0;
            progress = Math.min(uploadCount || 0, total);
          } else if (badge.category === 'quiz') {
            const match = badge.requirement.match(/\d+/);
            total = match ? parseInt(match[0]) : 0;
            progress = Math.min(perfectQuizCount || 0, total);
          } else if (badge.category === 'streak') {
            const match = badge.requirement.match(/\d+/);
            total = match ? parseInt(match[0]) : 0;
            progress = Math.min(userData?.streak || 0, total);
          }
        }

        return {
          ...badge,
          earned_at: earned ? earnedBadgesMap.get(badge.id) : undefined,
          progress: earned ? total : progress,
          total,
        };
      }) || [];

      setBadges(mergedBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBadges(userId);
    setRefreshing(false);
  };

  const getFilteredBadges = () => {
    let filtered = badges;

    if (activeFilter === 'earned') {
      filtered = badges.filter(b => b.earned_at);
    } else if (activeFilter === 'locked') {
      filtered = badges.filter(b => !b.earned_at);
    } else if (activeFilter !== 'all') {
      filtered = badges.filter(b => b.category === activeFilter);
    }

    return filtered;
  };

  const openBadgeModal = (badge: Badge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const closeBadgeDetail = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedBadge(null), 300);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressPercentage = (badge: Badge) => {
    if (badge.earned_at || !badge.total) return 100;
    return Math.round((badge.progress || 0) / badge.total * 100);
  };

  const renderBadgeCard = ({ item, index }: { item: Badge; index: number }) => {
    const isLocked = !item.earned_at;
    const progressPercentage = getProgressPercentage(item);

    return (
      <AnimatedTouchable
        style={[styles.badgeCard, isLocked && styles.badgeCardLocked]}
        entering={FadeInDown.duration(400).delay(Math.min(index * 50, 500))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          openBadgeModal(item);
        }}
        activeOpacity={0.7}
      >
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={20} color="#fff" />
          </View>
        )}

        <Text style={[styles.badgeIcon, isLocked && styles.badgeIconLocked]}>
          {item.icon}
        </Text>

        <Text style={[styles.badgeName, isLocked && styles.badgeNameLocked]} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={[styles.badgePoints, isLocked && styles.badgePointsLocked]}>
          +{item.points_reward} XP
        </Text>

        {isLocked && item.total && item.total > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {item.progress}/{item.total}
            </Text>
          </View>
        )}

        {!isLocked && item.earned_at && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.earnedText}>{formatDate(item.earned_at)}</Text>
          </View>
        )}
      </AnimatedTouchable>
    );
  };

  const renderFilterChip = (filter: FilterType, label: string, icon?: string) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActiveFilter(filter);
        }}
      >
        {icon && (
          <Text style={[styles.filterIcon, isActive && styles.filterIconActive]}>
            {icon}
          </Text>
        )}
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredBadges = getFilteredBadges();
  const earnedCount = badges.filter(b => b.earned_at).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={styles.header} entering={FadeInUp.duration(500)}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Badges</Text>
          <Text style={styles.subtitle}>
            {earnedCount}/{totalCount} Earned
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Filter Chips */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContentContainer}
          >
            {renderFilterChip('all', 'All')}
            {renderFilterChip('earned', 'Earned', '✅')}
            {renderFilterChip('locked', 'Locked', '🔒')}
            {renderFilterChip('upload', 'Upload', '📚')}
            {renderFilterChip('quiz', 'Quiz', '📝')}
            {renderFilterChip('streak', 'Streak', '🔥')}
            {renderFilterChip('achievement', 'Achievement', '🏆')}
            {renderFilterChip('social', 'Social', '👥')}
          </ScrollView>
        </Animated.View>

        {/* Badge Grid */}
        <View style={styles.gridContainer}>
          <FlatList
            data={filteredBadges}
            renderItem={renderBadgeCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContent}
            ListEmptyComponent={
              <Animated.View
                style={styles.emptyState}
                entering={FadeInDown.duration(500).delay(200)}
              >
                <Text style={styles.emptyIcon}>🏅</Text>
                <Text style={styles.emptyTitle}>No badges found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeFilter === 'earned'
                    ? 'Complete activities to earn your first badge!'
                    : 'Try adjusting your filters'}
                </Text>
              </Animated.View>
            }
          />
        </View>
      </ScrollView>

      {/* Badge Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeBadgeDetail}
      >
        <View style={styles.modalOverlay}>
          <AnimatedTouchable
            style={styles.modalBackdrop}
            onPress={closeBadgeDetail}
            activeOpacity={1}
          />

          {selectedBadge && (
            <Animated.View
              style={styles.modalContent}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
            >
              <TouchableOpacity style={styles.closeButton} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                closeBadgeDetail();
              }}>
                <Ionicons name="close" size={28} color={Colors.text} />
              </TouchableOpacity>

              <Text
                style={[
                  styles.modalIcon,
                  !selectedBadge.earned_at && styles.modalIconLocked,
                ]}
              >
                {selectedBadge.icon}
              </Text>

              {!selectedBadge.earned_at && (
                <View style={styles.modalLockBadge}>
                  <Ionicons name="lock-closed" size={16} color="#fff" />
                  <Text style={styles.modalLockText}>Locked</Text>
                </View>
              )}

              <Text style={styles.modalTitle}>{selectedBadge.name}</Text>
              <Text style={styles.modalDescription}>{selectedBadge.description}</Text>

              <View style={styles.modalDivider} />

              <View style={styles.modalRow}>
                <View style={styles.modalInfoBox}>
                  <Ionicons name="star" size={20} color={Colors.warning} />
                  <Text style={styles.modalInfoLabel}>Reward</Text>
                  <Text style={styles.modalInfoValue}>+{selectedBadge.points_reward} XP</Text>
                </View>

                <View style={styles.modalInfoBox}>
                  <Ionicons name="bookmark" size={20} color={Colors.primary} />
                  <Text style={styles.modalInfoLabel}>Category</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedBadge.category.charAt(0).toUpperCase() +
                      selectedBadge.category.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.requirementBox}>
                <Text style={styles.requirementLabel}>Requirement</Text>
                <Text style={styles.requirementText}>{selectedBadge.requirement}</Text>
              </View>

              {!selectedBadge.earned_at && selectedBadge.total && selectedBadge.total > 0 && (
                <View style={styles.modalProgressContainer}>
                  <View style={styles.modalProgressHeader}>
                    <Text style={styles.modalProgressLabel}>Progress</Text>
                    <Text style={styles.modalProgressValue}>
                      {selectedBadge.progress}/{selectedBadge.total}
                    </Text>
                  </View>
                  <View style={styles.modalProgressBar}>
                    <View
                      style={[
                        styles.modalProgressFill,
                        { width: `${getProgressPercentage(selectedBadge)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.modalProgressText}>
                    {(selectedBadge.total || 0) - (selectedBadge.progress || 0)} more to go!
                  </Text>
                </View>
              )}

              {selectedBadge.earned_at && (
                <View style={styles.earnedContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  <Text style={styles.earnedLabel}>Earned on</Text>
                  <Text style={styles.earnedDate}>{formatDate(selectedBadge.earned_at)}</Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  // Filters
  filterContainer: {
    marginBottom: Spacing.lg,
  },
  filterContentContainer: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterIconActive: {
    opacity: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  // Grid
  gridContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  gridContent: {
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  // Badge Card
  badgeCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeIconLocked: {
    filter: 'grayscale(100%)',
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 36,
  },
  badgeNameLocked: {
    color: Colors.textSecondary,
  },
  badgePoints: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 8,
  },
  badgePointsLocked: {
    color: Colors.textSecondary,
  },
  // Progress
  progressContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Earned Badge
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earnedText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  modalIconLocked: {
    filter: 'grayscale(100%)',
    opacity: 0.5,
  },
  modalLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 4,
  },
  modalLockText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: Typography.h2,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  modalInfoBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  requirementBox: {
    width: '100%',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 20,
  },
  requirementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
  },
  // Modal Progress
  modalProgressContainer: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 12,
  },
  modalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalProgressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  modalProgressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Earned
  earnedContainer: {
    width: '100%',
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
  },
  earnedLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  earnedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginTop: 4,
  },
});
