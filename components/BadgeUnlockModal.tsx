import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Colors, Typography } from '../constants/theme';

const { width } = Dimensions.get('window');

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
}

interface Props {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeUnlockModal({ visible, badge, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible && badge) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      confettiAnims.forEach(anim => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });

      // Badge entrance animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animation
      const confettiAnimations = confettiAnims.map((anim, index) => {
        const angle = (index / confettiAnims.length) * 2 * Math.PI;
        const distance = 150 + Math.random() * 100;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        return Animated.parallel([
          Animated.timing(anim.translateX, {
            toValue: targetX,
            duration: 1200 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: targetY,
            duration: 1200 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 720,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.stagger(50, confettiAnimations).start();
    }
  }, [visible, badge]);

  if (!badge) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiColors = [
    Colors.primary,
    Colors.secondary,
    Colors.warning,
    Colors.success,
    '#FF6B6B',
    '#4ECDC4',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: confettiColors[index % confettiColors.length],
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <View style={styles.container}>
          <Text style={styles.title}>🎉 Badge Unlocked! 🎉</Text>

          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ scale: scaleAnim }, { rotate }],
              },
            ]}
          >
            <View style={styles.badgeGlow} />
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
          </Animated.View>

          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>

          <View style={styles.rewardBox}>
            <Ionicons name="star" size={24} color={Colors.warning} />
            <Text style={styles.rewardText}>+{badge.points_reward} XP</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    top: '50%',
    left: '50%',
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  badgeContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  badgeGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    opacity: 0.2,
  },
  badgeIcon: {
    fontSize: 100,
  },
  badgeName: {
    fontSize: Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
    gap: 8,
  },
  rewardText: {
    fontSize: Typography.h4,
    fontWeight: 'bold',
    color: Colors.warning,
  },
  closeButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.h4,
    fontWeight: '600',
    color: Colors.white,
  },
});
