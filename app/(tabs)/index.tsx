import { Card } from '@/components/Card';
import { Text, View } from '@/components/Themed';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { calculateLevel, calculateProgress } from '@/lib/gamification';
import { mockUser } from '@/lib/mockData';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const user = mockUser;
  const level = calculateLevel(user.points);
  const progress = calculateProgress(user.points);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.usernameText}>{user.username}! 👋</Text>
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Level {level}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.streak} 🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress)}% to Level {level + 1}
        </Text>
      </Card>

      {/* Quick Upload Button */}
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>📤 Upload New Material</Text>
      </TouchableOpacity>

      {/* Continue Learning Section */}
      <Text style={styles.sectionTitle}>Continue Learning</Text>
      <Card style={styles.contentCard}>
        <Text style={styles.contentTitle}>Introduction to AI</Text>
        <Text style={styles.contentSubtitle}>Last accessed 2 hours ago</Text>
        <View style={styles.formatIcons}>
          <Text style={styles.formatIcon}>📝</Text>
          <Text style={styles.formatIcon}>🎧</Text>
          <Text style={styles.formatIcon}>❓</Text>
          <Text style={styles.formatIcon}>📖</Text>
        </View>
      </Card>

      {/* Recommended */}
      <Text style={styles.sectionTitle}>Recommended for You</Text>
      <Card style={styles.contentCard}>
        <Text style={styles.contentTitle}>Machine Learning Basics</Text>
        <Text style={styles.contentSubtitle}>Based on your learning style</Text>
        <View style={styles.formatIcons}>
          <Text style={styles.formatIcon}>📝</Text>
          <Text style={styles.formatIcon}>🎧</Text>
          <Text style={styles.formatIcon}>❓</Text>
          <Text style={styles.formatIcon}>📖</Text>
        </View>
      </Card>

      {/* Achievements Preview */}
      <Text style={styles.sectionTitle}>Recent Achievements</Text>
      <View style={styles.badgesContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🎯</Text>
          <Text style={styles.badgeText}>First Quiz</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🔥</Text>
          <Text style={styles.badgeText}>7-Day Streak</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  welcomeText: {
    fontSize: Typography.body,
    color: Colors.text,
  },
  usernameText: {
    fontSize: Typography.h2,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.h3,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.small,
    color: '#666',
    marginTop: Spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: Typography.small,
    color: '#666',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: Typography.h4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contentCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  contentTitle: {
    fontSize: Typography.h4,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  contentSubtitle: {
    fontSize: Typography.small,
    color: '#666',
    marginBottom: Spacing.md,
  },
  formatIcons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formatIcon: {
    fontSize: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  badge: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  badgeText: {
    fontSize: Typography.small,
    color: Colors.text,
    textAlign: 'center',
  },
});
