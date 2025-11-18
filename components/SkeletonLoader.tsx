import { Colors } from '@/constants/theme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ContentCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardIcon}>
        <SkeletonLoader width={32} height={32} borderRadius={8} />
      </View>
      <View style={styles.cardInfo}>
        <SkeletonLoader width="70%" height={16} />
        <View style={{ height: 8 }} />
        <SkeletonLoader width="50%" height={12} />
      </View>
      <View style={styles.cardStatus}>
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function ResultScreenSkeleton() {
  return (
    <View style={styles.resultContainer}>
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <SkeletonLoader width="60%" height={18} />
          <View style={{ height: 8 }} />
          <SkeletonLoader width="40%" height={12} />
        </View>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
      </View>

      {/* Tab Bar Skeleton */}
      <View style={styles.tabBarSkeleton}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.tabSkeleton}>
            <SkeletonLoader width={20} height={20} borderRadius={10} />
            <View style={{ height: 4 }} />
            <SkeletonLoader width={40} height={12} />
          </View>
        ))}
      </View>

      {/* Content Skeleton */}
      <View style={styles.contentSkeleton}>
        <View style={styles.sectionSkeleton}>
          <SkeletonLoader width="100%" height={100} />
          <View style={{ height: 16 }} />
          <SkeletonLoader width="90%" height={16} />
          <View style={{ height: 8 }} />
          <SkeletonLoader width="95%" height={16} />
          <View style={{ height: 8 }} />
          <SkeletonLoader width="85%" height={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardStatus: {
    alignItems: 'flex-end',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  tabBarSkeleton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabSkeleton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSkeleton: {
    flex: 1,
    padding: 16,
  },
  sectionSkeleton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
});
