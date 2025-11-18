import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface StreakWarningToastProps {
  visible: boolean;
  streak: number;
  onHide: () => void;
  onActionPress?: () => void;
}

const { width } = Dimensions.get('window');

export default function StreakWarningToast({
  visible,
  streak,
  onHide,
  onActionPress,
}: StreakWarningToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const handleActionPress = () => {
    hideToast();
    if (onActionPress) {
      onActionPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Warning Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.flameIcon}>🔥</Text>
          <View style={styles.warningBadge}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Don't break your streak!</Text>
          <Text style={styles.message}>
            You have a {streak}-day streak. Keep learning today to maintain it.
          </Text>
        </View>

        {/* Action Button */}
        {onActionPress && (
          <TouchableOpacity style={styles.actionButton} onPress={handleActionPress}>
            <Text style={styles.actionText}>Learn Now</Text>
          </TouchableOpacity>
        )}

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  flameIcon: {
    fontSize: 40,
    lineHeight: 40,
  },
  warningBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  warningIcon: {
    fontSize: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
});
