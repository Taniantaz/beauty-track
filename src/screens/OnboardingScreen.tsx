// Onboarding Screen

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';
import { ONBOARDING_SLIDES } from '../data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

const OnboardingSlide: React.FC<{
  item: typeof ONBOARDING_SLIDES[0];
  index: number;
}> = ({ item, index }) => {
  const getIcon = () => {
    switch (item.image) {
      case 'beauty':
        return 'flower-outline';
      case 'photos':
        return 'images-outline';
      case 'reminder':
        return 'notifications-outline';
      default:
        return 'sparkles-outline';
    }
  };

  return (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        <LinearGradient
          colors={GRADIENTS.card}
          style={styles.illustrationBg}
        >
          <View style={styles.iconCircle}>
            <Ionicons 
              name={getIcon() as any} 
              size={64} 
              color={COLORS.primary} 
            />
          </View>
        </LinearGradient>
        
        {/* Decorative elements */}
        <View style={[styles.floatingDot, styles.dot1]} />
        <View style={[styles.floatingDot, styles.dot2]} />
        <View style={[styles.floatingDot, styles.dot3]} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={GRADIENTS.background}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip Button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + SIZES.md }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item, index }) => (
          <OnboardingSlide item={item} index={index} />
        )}
        keyExtractor={(item) => item.id}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        scrollEnabled={true}
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + SIZES.lg }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color="#FFFFFF" 
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity style={styles.signInLink}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  skipButton: {
    position: 'absolute',
    right: SIZES.lg,
    zIndex: 10,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  skipText: {
    fontSize: SIZES.fontMd,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SIZES.xl,
    paddingTop: SCREEN_HEIGHT * 0.15,
  },
  illustrationContainer: {
    height: SCREEN_HEIGHT * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  illustrationBg: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    paddingHorizontal: SIZES.md,
  },
  bottomSection: {
    paddingHorizontal: SIZES.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: SIZES.sm,
  },
  nextButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  signInText: {
    fontSize: SIZES.fontMd,
    color: COLORS.lightText,
  },
  signInTextBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default OnboardingScreen;

