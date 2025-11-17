import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UploadScreen() {
  const router = useRouter();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedFile = result.assets[0];
        setFile(selectedFile);
        
        // Auto-fill title from filename
        if (!title) {
          const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
          setTitle(fileName);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert('No File', 'Please select a file first');
      return;
    }

    if (!title.trim()) {
      Alert.alert('No Title', 'Please enter a title for your content');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Read file as blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      setProgress(30);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content-files')
        .upload(filePath, blob, {
          contentType: file.mimeType || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(60);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-files')
        .getPublicUrl(filePath);

      setProgress(80);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: title.trim(),
          file_url: publicUrl,
          file_type: fileExt,
          file_size: file.size,
          status: 'uploaded',
        });

      if (dbError) throw dbError;

      setProgress(100);

      Alert.alert('Success!', 'File uploaded successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEmoji}>📤</Text>
          <Text style={styles.headerTitle}>Upload Content</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* File Picker */}
        <View style={styles.content}>
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={pickDocument}
          disabled={uploading}
        >
          {file ? (
            <View style={styles.filePreview}>
              <Ionicons name="document" size={48} color={Colors.primary} />
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileSize}>
                {file.size ? (file.size / 1024).toFixed(2) : '0'} KB
              </Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={pickDocument}
              >
                <Text style={styles.changeButtonText}>Change File</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPrompt}>
              <Ionicons name="cloud-upload-outline" size={64} color="#CCC" />
              <Text style={styles.uploadText}>Tap to select a file</Text>
              <Text style={styles.uploadSubtext}>PDF, TXT, DOC, DOCX</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title Input */}
        {file && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Content Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Introduction to Biology"
              value={title}
              onChangeText={setTitle}
              editable={!uploading}
            />
          </View>
        )}

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% uploaded</Text>
          </View>
        )}

        {/* Upload Button */}
        {file && (
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={uploadFile}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.uploadButtonText}>Upload & Convert</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your file will be converted into 4 learning formats: Notes, Audio, Quiz, and Story
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: Typography.h3,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    padding: Spacing.xl,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DDD',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginBottom: Spacing.xl,
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: Typography.h4,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  uploadSubtext: {
    fontSize: Typography.small,
    color: '#999',
    marginTop: Spacing.xs,
  },
  filePreview: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: Typography.small,
    color: '#666',
    marginTop: Spacing.xs,
  },
  changeButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changeButtonText: {
    color: Colors.primary,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: Typography.small,
    color: '#666',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: Typography.h4,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.small,
    color: Colors.primary,
    lineHeight: 18,
  },
});
