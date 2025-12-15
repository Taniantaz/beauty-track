// Profile Screen

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";
import AnimatedScreen from "../components/AnimatedScreen";
import { useUserStore } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGuestStore } from "../store/useGuestStore";

interface ProfileScreenProps {
  navigation: any;
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  iconColor = COLORS.primary,
  iconBgColor,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true,
}) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    disabled={!onPress && !rightElement}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View
      style={[
        styles.settingsIcon,
        { backgroundColor: iconBgColor || `${iconColor}15` },
      ]}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.settingsContent}>
      <Text style={styles.settingsTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement ||
      (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.mutedText} />
      ))}
  </TouchableOpacity>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const localUser = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const { user: authUser, session, signOut, isGuest } = useAuthStore();
  const { isGuestMode } = useGuestStore();
  const [faceIdEnabled, setFaceIdEnabled] = useState(localUser.faceIdEnabled);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    localUser.darkModeEnabled
  );

  // Check if user is in guest mode
  const isGuestUser = isGuest || isGuestMode;

  // Use authenticated user info if available, otherwise fall back to local user
  // For guest users, show "Guest" and hide email
  const displayName = isGuestUser
    ? "Guest"
    : authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      localUser.name;
  const displayEmail = isGuestUser ? null : authUser?.email || localUser.email;
  const avatarUrl =
    authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture;
  const isAuthenticated = !!session;

  const usagePercent =
    (localUser.procedureCount / localUser.maxProcedures) * 100;

  const handleFaceIdToggle = (value: boolean) => {
    setFaceIdEnabled(value);
    updateUser({ faceIdEnabled: value });
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    updateUser({ darkModeEnabled: value });
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: "GoogleSignIn" }],
          });
        },
      },
    ]);
  };

  const handleSignIn = () => {
    navigation.navigate("GoogleSignIn");
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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={COLORS.darkText}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={GRADIENTS.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.profileGradient}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons
                      name="person-outline"
                      size={32}
                      color={COLORS.primary}
                    />
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{displayName}</Text>
                  {displayEmail && (
                    <Text style={styles.profileEmail}>{displayEmail}</Text>
                  )}
                  {!isGuestUser && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planText}>
                        {localUser.isPremium ? "Premium" : "Free Plan"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Auth Status Badge */}
              {isAuthenticated && (
                <View style={styles.authBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.authBadgeText}>
                    Signed in with Google
                  </Text>
                </View>
              )}

              {/* Usage Bar */}
              <View style={styles.usageSection}>
                <View style={styles.usageHeader}>
                  <Text style={styles.usageLabel}>Procedures used</Text>
                  <Text style={styles.usageCount}>
                    {localUser.procedureCount} / {localUser.maxProcedures}
                  </Text>
                </View>
                <View style={styles.usageBarBg}>
                  <View
                    style={[
                      styles.usageBarFill,
                      { width: `${Math.min(usagePercent, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <SettingsItem
              icon="finger-print"
              iconColor="#E57B9D"
              title="Face ID Lock"
              subtitle="Secure your journal"
              rightElement={
                <Switch
                  value={faceIdEnabled}
                  onValueChange={handleFaceIdToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={faceIdEnabled ? COLORS.cardBackground : "#f4f3f4"}
                />
              }
              showArrow={false}
            />
            {/* Dark Mode */}
            {/* TODO: Implement Dark Mode - currently disabled -- maybe create feature flag for this?*/}
            {false && (
              <>
                <SettingsItem
                  icon="moon-outline"
                  iconColor="#7B9DC9"
                  title="Dark Mode"
                  subtitle="Easy on the eyes"
                  rightElement={
                    <Switch
                      value={darkModeEnabled}
                      onValueChange={handleDarkModeToggle}
                      trackColor={{
                        false: COLORS.border,
                        true: COLORS.primary,
                      }}
                      thumbColor={
                        darkModeEnabled ? COLORS.cardBackground : "#f4f3f4"
                      }
                    />
                  }
                  showArrow={false}
                />
              </>
            )}
          </View>

          {/* Premium & Features */}
          <View style={styles.section}>
            <SettingsItem
              icon="diamond-outline"
              iconColor="#F2A679"
              title="Upgrade to Premium"
              subtitle="Unlimited procedures & photos"
              onPress={() => navigation.navigate("PremiumUpgrade")}
            />
            <SettingsItem
              icon="cloud-outline"
              iconColor="#81B4D8"
              title="Cloud Backup"
              subtitle="Synced and secure"
              onPress={() => {}}
            />
            <SettingsItem
              icon="help-circle-outline"
              iconColor={COLORS.darkText}
              title="Help & Support"
              subtitle="FAQ and contact us"
              onPress={() => {}}
            />
            <SettingsItem
              icon="shield-outline"
              iconColor={COLORS.darkText}
              title="Privacy & Terms"
              subtitle="Your data is safe"
              onPress={() => {}}
            />
          </View>

          {/* Sign In / Sign Out */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color="#E57B9D" />
              <Text style={[styles.signOutText, { color: "#E57B9D" }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
            >
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text style={styles.signInText}>Sign In with Google</Text>
            </TouchableOpacity>
          )}

          {/* Version */}
          <Text style={styles.versionText}>Beauty Track v1.0.0</Text>
        </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  headerTitle: {
    fontSize: SIZES.fontXxl,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  settingsButton: {
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
  profileCard: {
    borderRadius: SIZES.radiusXl,
    overflow: "hidden",
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  profileGradient: {
    padding: SIZES.lg,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  profileEmail: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginTop: 2,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    marginTop: SIZES.sm,
  },
  planText: {
    fontSize: SIZES.fontXs,
    fontWeight: "600",
    color: COLORS.primary,
  },
  authBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: SIZES.sm,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.md,
    alignSelf: "flex-start",
  },
  authBadgeText: {
    fontSize: SIZES.fontXs,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
  },
  usageSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.sm,
  },
  usageLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
  },
  usageCount: {
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    color: COLORS.darkText,
  },
  usageBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  usageBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  section: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.darkText,
  },
  settingsSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  signOutText: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    marginLeft: SIZES.sm,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  signInText: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.darkText,
    marginLeft: SIZES.sm,
  },
  versionText: {
    textAlign: "center",
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
    marginBottom: SIZES.lg,
  },
});

export default ProfileScreen;
