// Google Sign In Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

// Register for redirects
WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInScreenProps {
  navigation: any;
}

const GoogleSignInScreen: React.FC<GoogleSignInScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const { setSession } = useAuthStore();

  // Create redirect URI for OAuth
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'beautytrack',
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Start OAuth flow with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open the OAuth URL in the browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
        );

        if (result.type === 'success' && result.url) {
          // Extract the tokens from the URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            // Set the session manually
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              throw sessionError;
            }

            if (sessionData.session) {
              setSession(sessionData.session);
              navigation.replace('MainTabs');
            }
          }
        } else if (result.type === 'cancel') {
          // User cancelled the sign-in
          console.log('User cancelled sign-in');
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert(
        'Sign In Error',
        error.message || 'An error occurred during sign in. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
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
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <View style={styles.googleButtonContent}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons 
                    name="logo-google" 
                    size={24} 
                    color="#4285F4" 
                  />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </>
              )}
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
            disabled={isLoading}
          >
            <Text style={[styles.skipText, isLoading && styles.skipTextDisabled]}>
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
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.md,
    minHeight: 24,
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
  skipTextDisabled: {
    opacity: 0.5,
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
