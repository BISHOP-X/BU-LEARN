import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AudioTabProps {
  audio: {
    url: string;
    duration: number;
    transcript: string;
  };
}

export default function AudioTab({ audio }: AudioTabProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  // Simulate audio playback (mock)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= audio.duration) {
            setIsPlaying(false);
            return audio.duration;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, audio.duration]);

  const togglePlayPause = () => {
    if (currentTime >= audio.duration) {
      // Restart if finished
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    setCurrentTime((prev) => Math.min(prev + 15, audio.duration));
  };

  const skipBackward = () => {
    setCurrentTime((prev) => Math.max(prev - 15, 0));
  };

  const handleSeek = (value: number) => {
    setCurrentTime(value);
  };

  const cyclePlaybackSpeed = () => {
    const currentIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setPlaybackSpeed(speedOptions[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / audio.duration) * 100;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Audio Visualizer / Cover Art Placeholder */}
        <View style={styles.visualizerContainer}>
          <View style={styles.visualizer}>
            <Ionicons name="musical-notes" size={64} color={Colors.primary} />
            <Text style={styles.visualizerText}>Audio Lesson</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={audio.duration}
            value={currentTime}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={Colors.primary}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(audio.duration)}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          {/* Speed Control */}
          <TouchableOpacity style={styles.speedButton} onPress={cyclePlaybackSpeed}>
            <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          {/* Skip Backward */}
          <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
            <Ionicons name="play-back" size={32} color={Colors.primary} />
            <Text style={styles.skipLabel}>15s</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={48}
              color={Colors.white}
            />
          </TouchableOpacity>

          {/* Skip Forward */}
          <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
            <Ionicons name="play-forward" size={32} color={Colors.primary} />
            <Text style={styles.skipLabel}>15s</Text>
          </TouchableOpacity>

          {/* Placeholder for symmetry */}
          <View style={styles.speedButton} />
        </View>

        {/* Transcript Section */}
        <View style={styles.transcriptSection}>
          <TouchableOpacity
            style={styles.transcriptHeader}
            onPress={() => setShowTranscript(!showTranscript)}
          >
            <View style={styles.transcriptHeaderLeft}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
              <Text style={styles.transcriptTitle}>Transcript</Text>
            </View>
            <Ionicons
              name={showTranscript ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {showTranscript && (
            <View style={styles.transcriptContent}>
              <Text style={styles.transcriptText}>{audio.transcript}</Text>
            </View>
          )}
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={24} color={Colors.secondary} />
            <Text style={styles.infoCardLabel}>Duration</Text>
            <Text style={styles.infoCardValue}>
              {Math.floor(audio.duration / 60)} minutes
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="flash-outline" size={24} color={Colors.accent} />
            <Text style={styles.infoCardLabel}>Speed</Text>
            <Text style={styles.infoCardValue}>{playbackSpeed}x</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="headset-outline" size={24} color={Colors.primary} />
            <Text style={styles.infoCardLabel}>Format</Text>
            <Text style={styles.infoCardValue}>Audio</Text>
          </View>
        </View>

        {/* Mock Notice */}
        <View style={styles.mockNotice}>
          <Ionicons name="information-circle" size={20} color={Colors.secondary} />
          <Text style={styles.mockNoticeText}>
            This is a mock audio player. Real audio playback will be implemented with actual
            audio files.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  visualizerContainer: {
    marginBottom: 32,
  },
  visualizer: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  visualizerText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginTop: 12,
  },
  progressContainer: {
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: Colors.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  speedButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  speedButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  controlButton: {
    position: 'relative',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipLabel: {
    position: 'absolute',
    bottom: -2,
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  transcriptSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
  },
  transcriptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
  },
  transcriptContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: Colors.background,
  },
  transcriptText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  infoCardValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
    marginTop: 4,
  },
  mockNotice: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  mockNoticeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});
