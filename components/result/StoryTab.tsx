import { Colors } from '@/constants/theme';
import { StoryChapter } from '@/lib/mockData';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface StoryTabProps {
  story: {
    totalChapters: number;
    estimatedReadingTime: number;
    chapters: StoryChapter[];
  };
}

export default function StoryTab({ story }: StoryTabProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const currentChapter = story.chapters[currentChapterIndex];
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === story.chapters.length - 1;

  const goToNextChapter = () => {
    if (!isLastChapter) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setBookmarked(false);
    } else {
      Alert.alert(
        'Story Complete!',
        'Congratulations! You\'ve finished reading the entire story.',
        [
          { text: 'Read Again', onPress: () => setCurrentChapterIndex(0) },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  const goToPreviousChapter = () => {
    if (!isFirstChapter) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      setBookmarked(false);
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      Alert.alert('Bookmarked', 'Chapter saved for later reading');
    }
  };

  const renderParagraphs = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim().length === 0) return null;
      return (
        <Text key={index} style={styles.paragraph}>
          {paragraph.trim()}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Chapter Info Bar */}
      <View style={styles.chapterInfoBar}>
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterLabel}>Chapter {currentChapter.chapterNumber}</Text>
          <Text style={styles.chapterTitle}>{currentChapter.title}</Text>
        </View>
        <View style={styles.chapterMeta}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.chapterMetaText}>
            {currentChapter.readingTimeMinutes} min read
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentChapterIndex + 1) / story.chapters.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentChapterIndex + 1} of {story.chapters.length} chapters
        </Text>
      </View>

      {/* Story Content */}
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {renderParagraphs(currentChapter.content)}
        
        {/* End of Chapter Message */}
        {!isLastChapter && (
          <View style={styles.chapterEndCard}>
            <Ionicons name="book" size={24} color={Colors.primary} />
            <Text style={styles.chapterEndText}>End of Chapter {currentChapter.chapterNumber}</Text>
            <TouchableOpacity style={styles.nextChapterButton} onPress={goToNextChapter}>
              <Text style={styles.nextChapterButtonText}>Continue to Next Chapter</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {isLastChapter && (
          <View style={styles.storyEndCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            <Text style={styles.storyEndTitle}>Story Complete!</Text>
            <Text style={styles.storyEndText}>
              You've finished reading all {story.chapters.length} chapters.
            </Text>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => setCurrentChapterIndex(0)}
            >
              <Ionicons name="refresh" size={20} color={Colors.primary} />
              <Text style={styles.restartButtonText}>Read Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.navigationFooter}>
        <TouchableOpacity
          style={[styles.navButton, isFirstChapter && styles.navButtonDisabled]}
          onPress={goToPreviousChapter}
          disabled={isFirstChapter}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={isFirstChapter ? Colors.textSecondary : Colors.primary}
          />
          <Text
            style={[
              styles.navButtonText,
              isFirstChapter && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={bookmarked ? Colors.accent : Colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={goToNextChapter}>
          <Text style={styles.navButtonText}>
            {isLastChapter ? 'Finish' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chapterInfoBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chapterInfo: {
    marginBottom: 4,
  },
  chapterLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chapterMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
  },
  progressContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  paragraph: {
    fontSize: 17,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 16,
    textAlign: 'justify',
  },
  chapterEndCard: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  chapterEndText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  nextChapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextChapterButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  storyEndCard: {
    backgroundColor: Colors.success + '10',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  storyEndTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  storyEndText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  restartButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  bottomSpacing: {
    height: 32,
  },
  navigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: Colors.background,
  },
});
