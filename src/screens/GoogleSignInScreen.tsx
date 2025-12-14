// Google Sign In Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';

interface GoogleSignInScreenProps {
  navigation: any;
}

const GoogleSignInScreen: React.FC<GoogleSignInScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In with Supabase
    // For now, just navigate to main app
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    // Allow users to skip sign in for now
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={GRADIENTS.background}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + SIZES.xxl }]}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <LinearGradient
            colors={GRADIENTS.card}
            style={styles.illustrationBg}
          >
            <View style={styles.iconCircle}>
              <Ionicons 
                name="person-circle-outline" 
                size={80} 
                color={COLORS.primary} 
              />
            </View>
          </LinearGradient>
          
          {/* Decorative elements */}
          <View style={[styles.floatingDot, styles.dot1]} />
          <View style={[styles.floatingDot, styles.dot2]} />
          <View style={[styles.floatingDot, styles.dot3]} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Beauty Track</Text>
          <Text style={styles.description}>
            Sign in to sync your beauty journey across all your devices and never lose your progress.
          </Text>
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.9}
          >
            <View style={styles.googleButtonContent}>
              <Ionicons 
                name="logo-google" 
                size={24} 
                color="#4285F4" 
              />
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Skip Link */}
          <TouchableOpacity 
            style={styles.skipLink}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>
              Continue without signing in
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.xl,
    justifyContent: 'space-between',
    paddingBottom: SIZES.xxl,
  },
  illustrationContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xxl,
  },
  illustrationBg: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: COLORS.primary,
  },
  dot1: {
    width: 16,
    height: 16,
    top: 40,
    left: 60,
    opacity: 0.3,
  },
  dot2: {
    width: 12,
    height: 12,
    bottom: 60,
    right: 50,
    opacity: 0.5,
  },
  dot3: {
    width: 8,
    height: 8,
    top: 100,
    right: 70,
    opacity: 0.4,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
  },
  title: {
    fontSize: SIZES.fontXxl,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: SIZES.fontMd,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SIZES.sm,
  },
  buttonContainer: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    paddingVertical: 18,
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.md,
  },
  googleButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
    paddingHorizontal: SIZES.md,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  skipText: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    paddingTop: SIZES.lg,
    paddingHorizontal: SIZES.md,
  },
  footerText: {
    fontSize: SIZES.fontXs,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default GoogleSignInScreen;

