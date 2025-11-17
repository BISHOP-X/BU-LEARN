import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { LearningStyle } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'quiz'>('form');
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Learning style
  const [selectedStyle, setSelectedStyle] = useState<LearningStyle | null>(null);

  const learningStyles: { value: LearningStyle; label: string; icon: string; description: string }[] = [
    {
      value: 'visual',
      label: 'Visual',
      icon: '👁️',
      description: 'I learn best with diagrams, charts, and images',
    },
    {
      value: 'auditory',
      label: 'Auditory',
      icon: '👂',
      description: 'I prefer listening and verbal explanations',
    },
    {
      value: 'reading',
      label: 'Reading/Writing',
      icon: '📖',
      description: 'I learn well through reading and taking notes',
    },
    {
      value: 'kinesthetic',
      label: 'Kinesthetic',
      icon: '✋',
      description: 'I learn by doing and hands-on practice',
    },
  ];

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep('quiz');
    }
  };

  const handleSignUp = async () => {
    if (!selectedStyle) {
      Alert.alert('Error', 'Please select your learning style');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            learning_style: selectedStyle,
          },
        },
      });

      if (error) throw error;

      Alert.alert('Success!', 'Account created successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'quiz') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonRow} 
            onPress={() => setStep('form')}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>How do you learn best?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your learning experience
          </Text>
        </View>

        <View style={styles.quizContainer}>
          {learningStyles.map((style) => (
            <TouchableOpacity
              key={style.value}
              style={[
                styles.styleCard,
                selectedStyle === style.value && styles.styleCardSelected,
              ]}
              onPress={() => setSelectedStyle(style.value)}
            >
              <Text style={styles.styleIcon}>{style.icon}</Text>
              <Text style={styles.styleLabel}>{style.label}</Text>
              <Text style={styles.styleDescription}>{style.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !selectedStyle && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading || !selectedStyle}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join BU-Learn and start your learning journey</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.primary,
    fontSize: Typography.body,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.body,
    color: '#666',
  },
  form: {
    paddingHorizontal: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
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
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.h4,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: Typography.body,
  },
  quizContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  styleCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  styleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FF',
  },
  styleIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  styleLabel: {
    fontSize: Typography.h4,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  styleDescription: {
    fontSize: Typography.small,
    color: '#666',
    textAlign: 'center',
  },
});
