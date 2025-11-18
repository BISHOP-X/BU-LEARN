import { ContentCardSkeleton } from '@/components/SkeletonLoader';
import Toast from '@/components/Toast';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { mockContent } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ContentItem = {
  id: string;
  title: string;
  file_type: string;
  status: string;
  created_at: string;
  user_id?: string;
};

type FilterType = 'all' | 'notes' | 'audio' | 'quiz' | 'story';
type SortType = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'type';

export default function LibraryScreen() {
  const router = useRouter();
  
  const [content, setContent] = useState<ContentItem[]>(mockContent as ContentItem[]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>(mockContent as ContentItem[]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date_desc');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [content, searchQuery, activeFilter, sortBy]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase content table
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Combine real data with mock data so library is never empty
      if (data && data.length > 0) {
        setContent([...data, ...mockContent] as ContentItem[]);
      } else {
        setContent(mockContent as ContentItem[]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Fallback to mock data on error
      setContent(mockContent as ContentItem[]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
    setToast({ visible: true, message: 'Library refreshed!', type: 'success' });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...content];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((item) => {
        const contentType = item.id.split('-')[0]; // Extract type from ID
        return contentType === activeFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'type':
          return a.file_type.localeCompare(b.file_type);
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  };

  const deleteContent = async (id: string) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Only delete from Supabase if it's real data (not mock)
              const isMockData = mockContent.some(mock => mock.id === id);
              
              if (!isMockData) {
                const { error } = await supabase
                  .from('content')
                  .delete()
                  .eq('id', id);

                if (error) throw error;
              }

              // Update local state
              setContent(prev => prev.filter(item => item.id !== id));
              setToast({ visible: true, message: 'Content deleted successfully', type: 'success' });
            } catch (error) {
              console.error('Error deleting content:', error);
              setToast({ visible: true, message: 'Failed to delete content', type: 'error' });
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => deleteContent(id)}
      >
        <Ionicons name="trash-outline" size={24} color={Colors.white} />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const cycleSortOption = () => {
    const sortOptions: SortType[] = ['date_desc', 'date_asc', 'name_asc', 'name_desc', 'type'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'date_desc': return 'Newest First';
      case 'date_asc': return 'Oldest First';
      case 'name_asc': return 'A → Z';
      case 'name_desc': return 'Z → A';
      case 'type': return 'By Type';
      default: return 'Sort';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'document-text';
      case 'txt':
        return 'document';
      case 'docx':
      case 'doc':
        return 'document-outline';
      default:
        return 'document';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'processing':
        return Colors.warning;
      case 'error':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleContentPress = (contentId: string, status: string) => {
    if (status === 'completed') {
      router.push(`/result/${contentId}` as any);
    } else if (status === 'processing') {
      // Could show a processing screen or alert
    }
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <Animated.View style={styles.header} entering={FadeInUp.duration(600)}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>My Library</Text>
            <Text style={styles.subtitle}>Your converted learning materials</Text>
          </View>
          <TouchableOpacity style={styles.sortButton} onPress={cycleSortOption}>
            <Ionicons name="swap-vertical" size={20} color={Colors.primary} />
            <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your library..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Filter Chips */}
      <Animated.View entering={FadeInUp.duration(700).delay(100)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'notes', 'audio', 'quiz', 'story'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.activeFilterChipText]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Content List */}
      <ScrollView
        style={styles.contentList}
        contentContainerStyle={styles.contentListContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {loading ? (
          <>
            <ContentCardSkeleton />
            <ContentCardSkeleton />
            <ContentCardSkeleton />
          </>
        ) : filteredContent.length > 0 ? (
          filteredContent.map((item, index) => (
            <Swipeable
              key={item.id}
              renderRightActions={() => renderRightActions(item.id)}
              overshootRight={false}
            >
              <AnimatedTouchable
                style={styles.contentCard}
                onPress={() => handleContentPress(item.id, item.status)}
                disabled={item.status !== 'completed'}
                entering={FadeInDown.duration(400).delay(Math.min(index * 100, 500))}
              >
                <View style={styles.contentIcon}>
                  <Ionicons
                    name={getFileIcon(item.file_type) as any}
                    size={32}
                    color={Colors.primary}
                  />
                </View>

                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.contentMeta}>
                    <Text style={styles.contentMetaText}>
                      {item.file_type.toUpperCase()}
                    </Text>
                    <View style={styles.metaDivider} />
                    <Text style={styles.contentMetaText}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>

                <View style={styles.contentStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(item.status) }]}
                    >
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                  {item.status === 'completed' && (
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  )}
                </View>
              </AnimatedTouchable>
            </Swipeable>
          ))
        ) : searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📚</Text>
            <Text style={styles.emptyTitle}>No content yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload your first document to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text,
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  contentList: {
    flex: 1,
  },
  contentListContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 8,
  },
  contentStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.h2,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: Spacing.sm,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteActionText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
});
