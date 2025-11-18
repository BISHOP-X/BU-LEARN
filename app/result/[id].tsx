import AudioTab from '@/components/result/AudioTab';
import NotesTab from '@/components/result/NotesTab';
import QuizTab from '@/components/result/QuizTab';
import StoryTab from '@/components/result/StoryTab';
import { Colors } from '@/constants/theme';
import { ConversionResult, getConversionById, mockConversionResult } from '@/lib/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TabType = 'notes' | 'audio' | 'quiz' | 'story';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ConversionResult | null>(null);

  useEffect(() => {
    loadConversionResult();
  }, [id]);

  const loadConversionResult = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get mock data (in production, fetch from Supabase)
      const data = getConversionById(id || '');
      
      if (data) {
        setResult(data);
      } else {
        // Fallback to default mock data
        setResult(mockConversionResult);
      }
    } catch (error) {
      console.error('Error loading conversion:', error);
      Alert.alert('Error', 'Failed to load conversion result');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!result) return null;

    switch (activeTab) {
      case 'notes':
        return <NotesTab notes={result.notes} />;
      case 'audio':
        return <AudioTab audio={result.audio} />;
      case 'quiz':
        return <QuizTab quiz={result.quiz} />;
      case 'story':
        return <StoryTab story={result.story} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading conversion...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Conversion Not Found</Text>
        <Text style={styles.errorText}>
          We couldn't find this conversion result.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {result.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {result.fileType.toUpperCase()} • {new Date(result.uploadDate).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerMoreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'notes' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'notes' && styles.activeTabText,
            ]}
          >
            Notes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'audio' && styles.activeTab]}
          onPress={() => setActiveTab('audio')}
        >
          <Ionicons
            name="headset"
            size={20}
            color={activeTab === 'audio' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'audio' && styles.activeTabText,
            ]}
          >
            Audio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'quiz' && styles.activeTab]}
          onPress={() => setActiveTab('quiz')}
        >
          <Ionicons
            name="help-circle"
            size={20}
            color={activeTab === 'quiz' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'quiz' && styles.activeTabText,
            ]}
          >
            Quiz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'story' && styles.activeTab]}
          onPress={() => setActiveTab('story')}
        >
          <Ionicons
            name="book"
            size={20}
            color={activeTab === 'story' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'story' && styles.activeTabText,
            ]}
          >
            Story
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  headerMoreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
  },
  activeTabText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
