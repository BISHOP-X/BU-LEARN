import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Check auth status and navigate
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 second splash
      
      // Check if user has seen onboarding before
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      console.log('🔍 hasSeenOnboarding:', hasSeenOnboarding);
      
      if (!hasSeenOnboarding) {
        // First time user - show onboarding
        console.log('✅ Going to onboarding');
        router.replace('/onboarding');
        return;
      }
      
      // Check if logged in
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 session:', session ? 'EXISTS' : 'NULL');
      
      if (session) {
        // User is logged in, go to home
        console.log('✅ Going to home');
        router.replace('/(tabs)');
      } else {
        // Not logged in, go to login
        console.log('✅ Going to login');
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('@/assets/images/LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
});
