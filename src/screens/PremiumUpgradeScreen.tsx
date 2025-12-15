// Premium Upgrade Screen
// Calm, premium, trustworthy, privacy-first design

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  PanResponder,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";
import AnimatedScreen from "../components/AnimatedScreen";
import Button from "../components/Button";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PremiumUpgradeScreenProps {
  navigation: any;
}

interface PlanCardProps {
  title: string;
  isPremium: boolean;
  features: Array<{ text: string; icon?: keyof typeof Ionicons.glyphMap }>;
}

const PlanCard: React.FC<PlanCardProps> = ({ title, isPremium, features }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isPremium) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isPremium, scaleAnim]);

  const cardContent = (
    <>
      <Text style={[styles.planTitle, isPremium && styles.planTitlePremium]}>
        {title}
      </Text>
      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            {feature.icon ? (
              <Ionicons
                name={feature.icon}
                size={20}
                color={isPremium ? COLORS.primary : COLORS.mutedText}
                style={styles.featureIcon}
              />
            ) : (
              <View style={styles.featureBullet} />
            )}
            <Text
              style={[
                styles.featureText,
                !isPremium && styles.featureTextMuted,
              ]}
            >
              {feature.text}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  if (isPremium) {
    return (
      <View style={styles.premiumCardWrapper}>
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Most Popular</Text>
        </View>
        <Animated.View
          style={[
            styles.planCard,
            styles.planCardPremium,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={[COLORS.softLavender, COLORS.cardBackground]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planCardGradient}
          >
            {cardContent}
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.planCard,
        styles.planCardFree,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {cardContent}
    </Animated.View>
  );
};

// Interactive Before/After Slider Component
const BeforeAfterSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(SCREEN_WIDTH / 2);
  const sliderAnim = useRef(new Animated.Value(SCREEN_WIDTH / 2)).current;
  const containerWidth = SCREEN_WIDTH - SIZES.lg * 2;
  const imageHeight = 280;

  // Mock images - in production, these would be demo images
  const beforeImageUri =
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400";
  const afterImageUri =
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400";

  const startX = useRef(containerWidth / 2);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX.current = sliderPosition;
      },
      onPanResponderMove: (_, gestureState) => {
        const minX = 0;
        const maxX = containerWidth;
        // Calculate new position based on delta from start
        const newPosition = Math.max(
          minX,
          Math.min(maxX, startX.current + gestureState.dx)
        );
        sliderAnim.setValue(newPosition);
        setSliderPosition(newPosition);
      },
      onPanResponderRelease: () => {
        // Smooth spring back to center on release
        Animated.spring(sliderAnim, {
          toValue: containerWidth / 2,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }).start();
        setSliderPosition(containerWidth / 2);
        startX.current = containerWidth / 2;
      },
    })
  ).current;

  return (
    <View style={[styles.sliderContainer, { width: containerWidth }]}>
      {/* After Image (Full) */}
      <Image
        source={{ uri: afterImageUri }}
        style={[styles.sliderImage, { height: imageHeight }]}
        resizeMode="cover"
      />

      {/* Before Image (Clipped) */}
      <Animated.View
        style={[
          styles.beforeImageContainer,
          {
            width: sliderAnim,
            height: imageHeight,
          },
        ]}
      >
        <Image
          source={{ uri: beforeImageUri }}
          style={[
            styles.sliderImage,
            styles.beforeImage,
            { height: imageHeight },
          ]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Slider Handle */}
      <Animated.View
        style={[
          styles.sliderHandleContainer,
          {
            left: Animated.subtract(sliderAnim, 20),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderLine} />
        <View style={styles.sliderHandle}>
          <Ionicons name="resize-outline" size={20} color={COLORS.darkText} />
        </View>
        <View style={styles.sliderLine} />
      </Animated.View>

      {/* Labels */}
      <View style={styles.sliderLabels}>
        <View style={styles.sliderLabel}>
          <Text style={styles.sliderLabelText}>Before</Text>
        </View>
        <View style={styles.sliderLabel}>
          <Text style={styles.sliderLabelText}>After</Text>
        </View>
      </View>
    </View>
  );
};

const TrustItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}> = ({ icon, text }) => (
  <View style={styles.trustItem}>
    <View style={styles.trustIcon}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.trustText}>{text}</Text>
  </View>
);

const PremiumUpgradeScreen: React.FC<PremiumUpgradeScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const freeFeatures = [
    { text: "Unlimited timeline entries" },
    { text: "2 photos per procedure" },
    { text: "Standard image quality" },
    { text: "Basic before/after toggle" },
    { text: "In-app reminders only" },
    { text: "Basic cloud storage" },
  ];

  const premiumFeatures = [
    { text: "10 photos per procedure", icon: "images-outline" as const },
    { text: "HD / full resolution images", icon: "camera-outline" as const },
    {
      text: "Interactive before/after slider",
      icon: "resize-outline" as const,
    },
    {
      text: "Push notifications & multiple reminders",
      icon: "notifications-outline" as const,
    },
    {
      text: "HD cloud backup & auto-sync",
      icon: "cloud-outline" as const,
    },
    {
      text: "PIN / FaceID lock & hide entries",
      icon: "shield-checkmark-outline" as const,
    },
  ];

  const handleUpgrade = () => {
    // TODO: Implement premium upgrade flow
    console.log("Upgrade to Premium");
  };

  return (
    <AnimatedScreen direction="left">
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          style={StyleSheet.absoluteFill}
        />
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
          translucent={false}
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SIZES.md }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section */}
          <View style={styles.topSection}>
            <Text style={styles.title}>Upgrade your timeline</Text>
            <Text style={styles.subtitle}>
              Unlock Pro to see every detail of your beauty journey
            </Text>
          </View>

          {/* Plan Comparison Cards */}
          <View style={styles.plansContainer}>
            <PlanCard title="Free" isPremium={false} features={freeFeatures} />
            <View style={styles.comparisonDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>vs</Text>
              <View style={styles.dividerLine} />
            </View>
            <PlanCard title="Pro" isPremium={true} features={premiumFeatures} />
          </View>

          {/* Hero Feature - Before/After Slider */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>See the difference</Text>
            <BeforeAfterSlider />
            <Text style={styles.heroCaption}>
              Interactive slider with zoom, pan & export — only in Pro
            </Text>
          </View>
        </ScrollView>

        {/* Sticky CTA Section */}
        <View
          style={[
            styles.ctaContainer,
            {
              paddingBottom: insets.bottom + SIZES.md,
              paddingTop: SIZES.md,
            },
          ]}
        >
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingText}>
              $4.99 / month · $29.99 / year
            </Text>
          </View>
          <Button
            title="Upgrade to Pro"
            onPress={handleUpgrade}
            variant="primary"
            size="large"
            fullWidth
            icon="diamond"
            iconPosition="left"
            style={styles.upgradeButton}
          />
          <View style={styles.ctaFooter}>
            <Text style={styles.ctaFooterText}>Cancel anytime</Text>
            <Text style={styles.ctaFooterText}>·</Text>
            <Text style={styles.ctaFooterText}>Free account required</Text>
          </View>
        </View>
      </View>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
  },
  topSection: {
    marginBottom: SIZES.xl,
    marginTop: SIZES.sm,
  },
  title: {
    fontSize: SIZES.fontDisplay,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: SIZES.sm,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: SIZES.fontLg,
    color: COLORS.warmCocoa,
    lineHeight: 24,
  },
  plansContainer: {
    flexDirection: "column",
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  comparisonDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SIZES.md,
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
    fontWeight: "600",
  },
  planCard: {
    width: "100%",
    borderRadius: SIZES.radiusXl,
    ...SHADOWS.small,
  },
  planCardFree: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.lg,
  },
  premiumCardWrapper: {
    marginTop: SIZES.md,
    marginBottom: SIZES.xs,
    position: "relative",
  },
  planCardPremium: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
    overflow: "hidden",
  },
  planCardGradient: {
    flex: 1,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusXl,
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: COLORS.honeyGold,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
    zIndex: 10,
    ...SHADOWS.small,
  },
  recommendedText: {
    fontSize: SIZES.fontXs,
    fontWeight: "600",
    color: COLORS.darkText,
  },
  planTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  planTitlePremium: {
    color: COLORS.primary,
  },
  featuresList: {
    gap: SIZES.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: SIZES.sm,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.mutedText,
    marginRight: SIZES.sm,
  },
  featureText: {
    fontSize: SIZES.fontSm,
    color: COLORS.darkText,
    flex: 1,
  },
  featureTextMuted: {
    color: COLORS.mutedText,
  },
  heroSection: {
    marginBottom: SIZES.xl,
  },
  heroTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: SIZES.lg,
    textAlign: "center",
  },
  heroCaption: {
    fontSize: SIZES.fontSm,
    color: COLORS.warmCocoa,
    textAlign: "center",
    marginTop: SIZES.md,
    lineHeight: 20,
  },
  sliderContainer: {
    height: 280,
    borderRadius: SIZES.radiusXl,
    overflow: "hidden",
    backgroundColor: COLORS.border,
    ...SHADOWS.medium,
  },
  sliderImage: {
    width: SCREEN_WIDTH - SIZES.lg * 2,
    position: "absolute",
    top: 0,
    left: 0,
  },
  beforeImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  beforeImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  sliderHandleContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  sliderLine: {
    flex: 1,
    width: 3,
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.medium,
  },
  sliderHandle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.large,
  },
  sliderLabels: {
    position: "absolute",
    top: SIZES.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.md,
  },
  sliderLabel: {
    backgroundColor: "rgba(58, 46, 92, 0.7)",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  sliderLabelText: {
    color: COLORS.cardBackground,
    fontSize: SIZES.fontXs,
    fontWeight: "600",
  },
  trustSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    ...SHADOWS.small,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  trustIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.softLavender,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  trustText: {
    fontSize: SIZES.fontMd,
    color: COLORS.darkText,
    flex: 1,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  pricingContainer: {
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  pricingText: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
    color: COLORS.darkText,
  },
  upgradeButton: {
    marginBottom: SIZES.sm,
  },
  ctaFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SIZES.xs,
  },
  ctaFooterText: {
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
  },
});

export default PremiumUpgradeScreen;
