import { Colors, Spacing, Typography } from '@/constants/theme';
import { mockContent } from '@/lib/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LibraryScreen() {
  const router = useRouter();
  const content = mockContent;

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>Your converted learning materials</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity style={[styles.filterChip, styles.activeFilterChip]}>
          <Text style={[styles.filterChipText, styles.activeFilterChipText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Audio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Story</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Content List */}
      <ScrollView style={styles.contentList} contentContainerStyle={styles.contentListContainer}>
        {content.length > 0 ? (
          content.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.contentCard}
              onPress={() => handleContentPress(item.id, item.status)}
              disabled={item.status !== 'completed'}
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
            </TouchableOpacity>
          ))
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
});
