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

interface Props {
  visible: boolean;
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ visible, oldLevel, newLevel, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const raysAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      glowAnim.setValue(0);
      raysAnim.setValue(0);
      particleAnims.forEach(anim => {
        anim.translateY.setValue(0);
        anim.opacity.setValue(1);
      });

      // Level number entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Glow pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rays rotation
      Animated.loop(
        Animated.timing(raysAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      // Particles rising animation
      const particleAnimations = particleAnims.map(anim =>
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: -150,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.stagger(200, particleAnimations).start();
    }
  }, [visible]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const raysRotation = raysAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

        {/* Rising particles */}
        {particleAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: width / 2 + (Math.cos((index / particleAnims.length) * 2 * Math.PI) * 80) - 4,
                transform: [{ translateY: anim.translateY }],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <View style={styles.container}>
          <Text style={styles.title}>🎉 Level Up! 🎉</Text>

          {/* Level display with glow and rays */}
          <View style={styles.levelContainer}>
            {/* Rotating rays */}
            <Animated.View
              style={[
                styles.rays,
                {
                  transform: [{ rotate: raysRotation }],
                },
              ]}
            >
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ray,
                    {
                      transform: [
                        { rotate: `${(i * 30)}deg` },
                        { translateY: -60 },
                      ],
                    },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Pulsing glow */}
            <Animated.View
              style={[
                styles.glow,
                {
                  opacity: glowOpacity,
                },
              ]}
            />

            {/* Level number */}
            <Animated.View
              style={[
                styles.levelBadge,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Ionicons name="star" size={32} color={Colors.warning} />
              <Text style={styles.levelNumber}>{newLevel}</Text>
            </Animated.View>
          </View>

          <Text style={styles.congratsText}>
            You reached Level {newLevel}!
          </Text>
          <Text style={styles.subtitle}>
            Keep learning to unlock more achievements
          </Text>

          {/* Stats */}
          <View style={styles.statsBox}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Previous Level</Text>
              <Text style={styles.statValue}>{oldLevel}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Level</Text>
              <Text style={styles.statValue}>{newLevel}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueButtonText}>Continue</Text>
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
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    top: '50%',
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
  levelContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  rays: {
    position: 'absolute',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    width: 3,
    height: 40,
    backgroundColor: Colors.warning,
    borderRadius: 2,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.warning,
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.warning,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.warning,
    marginTop: 4,
  },
  congratsText: {
    fontSize: Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsBox: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  continueButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: Typography.h4,
    fontWeight: '600',
    color: Colors.white,
  },
});
