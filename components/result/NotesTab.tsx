import Toast from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotesTabProps {
  notes: {
    summary: string;
    keyPoints: string[];
    detailedNotes: string;
  };
}

const NOTES_VIEW_KEY = '@notes_view_preference';

export default function NotesTab({ notes }: NotesTabProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  // Load saved preference
  useEffect(() => {
    loadViewPreference();
  }, []);

  // Save preference when changed
  useEffect(() => {
    saveViewPreference();
  }, [showDetailed]);

  const loadViewPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTES_VIEW_KEY);
      if (saved !== null) {
        setShowDetailed(saved === 'detailed');
      }
    } catch (error) {
      console.error('Failed to load view preference:', error);
    }
  };

  const saveViewPreference = async () => {
    try {
      await AsyncStorage.setItem(NOTES_VIEW_KEY, showDetailed ? 'detailed' : 'summary');
    } catch (error) {
      console.error('Failed to save view preference:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      const content = showDetailed ? notes.detailedNotes : formatSummaryText();
      await Clipboard.setStringAsync(content);
      setToast({ visible: true, message: 'Notes copied to clipboard', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Failed to copy', type: 'error' });
    }
  };

  const shareNotes = async () => {
    try {
      const content = showDetailed ? notes.detailedNotes : formatSummaryText();
      await Share.share({
        message: content,
        title: 'Study Notes',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatSummaryText = () => {
    let text = 'SUMMARY\n\n';
    text += notes.summary + '\n\n';
    text += 'KEY POINTS\n\n';
    notes.keyPoints.forEach((point, index) => {
      text += `${index + 1}. ${point}\n`;
    });
    return text;
  };

  const renderMarkdown = (text: string) => {
    // Split by lines and process markdown-like syntax
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        elements.push(
          <Text key={`code-${index}`} style={styles.codeText}>
            {line}
          </Text>
        );
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        if (listItems.length > 0) {
          elements.push(renderList(listItems, `list-${index}`));
          listItems = [];
        }
        elements.push(
          <Text key={`h1-${index}`} style={styles.heading1}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        if (listItems.length > 0) {
          elements.push(renderList(listItems, `list-${index}`));
          listItems = [];
        }
        elements.push(
          <Text key={`h2-${index}`} style={styles.heading2}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        if (listItems.length > 0) {
          elements.push(renderList(listItems, `list-${index}`));
          listItems = [];
        }
        elements.push(
          <Text key={`h3-${index}`} style={styles.heading3}>
            {line.replace('### ', '')}
          </Text>
        );
      }
      // List items
      else if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        listItems.push(line.trim().replace(/^[-•]\s*/, ''));
      }
      // Bold text
      else if (line.includes('**')) {
        if (listItems.length > 0) {
          elements.push(renderList(listItems, `list-${index}`));
          listItems = [];
        }
        elements.push(
          <Text key={`bold-${index}`} style={styles.paragraph}>
            {renderBoldText(line)}
          </Text>
        );
      }
      // Regular paragraph
      else if (line.trim().length > 0) {
        if (listItems.length > 0) {
          elements.push(renderList(listItems, `list-${index}`));
          listItems = [];
        }
        elements.push(
          <Text key={`p-${index}`} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
      // Empty line (spacing)
      else if (line.trim().length === 0 && elements.length > 0) {
        elements.push(<View key={`space-${index}`} style={styles.spacing} />);
      }
    });

    // Render remaining list items
    if (listItems.length > 0) {
      elements.push(renderList(listItems, 'list-final'));
    }

    return elements;
  };

  const renderList = (items: string[], key: string) => {
    return (
      <View key={key} style={styles.listContainer}>
        {items.map((item, idx) => (
          <View key={`${key}-item-${idx}`} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>{renderBoldText(item)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBoldText = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <Text key={idx} style={styles.boldText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
      
      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowDetailed(!showDetailed)}
        >
          <Ionicons
            name={showDetailed ? 'list' : 'document-text'}
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.actionButtonText}>
            {showDetailed ? 'Summary' : 'Detailed'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
          <Ionicons name="copy" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareNotes}>
          <Ionicons name="share-social" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Notes Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {!showDetailed ? (
          <>
            {/* Summary View */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Summary</Text>
              </View>
              <Text style={styles.summaryText}>{notes.summary}</Text>
            </View>

            {/* Key Points */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                <Text style={styles.sectionTitle}>Key Points</Text>
              </View>
              {notes.keyPoints.map((point, index) => (
                <View key={index} style={styles.keyPoint}>
                  <View style={styles.keyPointNumber}>
                    <Text style={styles.keyPointNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.keyPointText}>{point}</Text>
                </View>
              ))}
            </View>

            {/* Tip to view detailed notes */}
            <View style={styles.tipCard}>
              <Ionicons name="bulb" size={20} color={Colors.secondary} />
              <Text style={styles.tipText}>
                Tap "Detailed" above to see the full study notes with examples and explanations.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Detailed Notes View */}
            <View style={styles.detailedSection}>
              {renderMarkdown(notes.detailedNotes)}
            </View>
          </>
        )}

        {/* Bottom spacing */}
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  keyPointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  keyPointNumberText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  keyPointText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary + '15',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  detailedSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  heading1: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  listContainer: {
    marginVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.primary,
    width: 20,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
  },
  boldText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: Colors.text,
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 4,
    marginVertical: 2,
  },
  spacing: {
    height: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});
