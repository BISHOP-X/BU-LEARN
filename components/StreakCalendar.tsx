import { getStreakCalendar, getStreakStats, type StreakDay } from '@/lib/streakSystem';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface StreakCalendarProps {
  userId: string;
  onStreakUpdate?: (streak: number) => void;
}

export default function StreakCalendar({ userId, onStreakUpdate }: StreakCalendarProps) {
  const [calendar, setCalendar] = useState<StreakDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAtRisk, setIsAtRisk] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    loadStreakData();
  }, [userId]);

  const loadStreakData = async () => {
    setLoading(true);
    try {
      const [calendarData, statsData] = await Promise.all([
        getStreakCalendar(userId),
        getStreakStats(userId),
      ]);

      setCalendar(calendarData);
      setCurrentStreak(statsData.currentStreak);
      setIsAtRisk(statsData.isAtRisk);

      if (onStreakUpdate) {
        onStreakUpdate(statsData.currentStreak);
      }

      // Animate entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Streak Header */}
      <View style={styles.header}>
        <View style={styles.flameContainer}>
          <Text style={styles.flameIcon}>🔥</Text>
          {isAtRisk && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningIcon}>⚠️</Text>
            </View>
          )}
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Warning Message */}
      {isAtRisk && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Don't break your {currentStreak}-day streak! Open the app today to keep it going.
          </Text>
        </View>
      )}

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>Last 7 Days</Text>
        <View style={styles.calendarGrid}>
          {calendar.map((day, index) => (
            <View key={day.date} style={styles.dayContainer}>
              <Text style={styles.dayLabel}>{day.dayOfWeek}</Text>
              <View
                style={[
                  styles.daySquare,
                  day.isActive ? styles.dayActive : styles.dayInactive,
                ]}
              >
                {day.isActive && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Streak Tips */}
      {currentStreak === 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🎯 Start Your Streak!</Text>
          <Text style={styles.tipsText}>
            Upload content or complete a quiz daily to build your learning streak.
          </Text>
        </View>
      )}

      {currentStreak >= 7 && currentStreak < 30 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🚀 You're on Fire!</Text>
          <Text style={styles.tipsText}>
            Keep going! Reach 30 days to unlock the "Month Master" badge.
          </Text>
        </View>
      )}

      {currentStreak >= 30 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🏆 Streak Legend!</Text>
          <Text style={styles.tipsText}>
            Amazing dedication! You're an inspiration to learners everywhere.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flameContainer: {
    position: 'relative',
    marginRight: 16,
  },
  flameIcon: {
    fontSize: 64,
    lineHeight: 64,
  },
  warningBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  warningIcon: {
    fontSize: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#F97316',
    lineHeight: 48,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  calendarContainer: {
    marginTop: 8,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  daySquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  dayActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F97316',
  },
  dayInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  checkmark: {
    fontSize: 20,
    color: '#F97316',
    fontWeight: '700',
  },
  tipsContainer: {
    marginTop: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
