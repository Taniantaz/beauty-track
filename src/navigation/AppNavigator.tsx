// App Navigator

import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";
import { RootStackParamList, MainTabsParamList } from "../types";
import { useSettingsStore } from "../store/useSettingsStore";
import { useAuthStore } from "../store/useAuthStore";
import { useProcedureStore } from "../store/useProcedureStore";
import { useGuestStore } from "../store/useGuestStore";

// Screens
import OnboardingScreen from "../screens/OnboardingScreen";
import GoogleSignInScreen from "../screens/GoogleSignInScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddProcedureScreen from "../screens/AddProcedureScreen";
import ProcedureDetailsScreen from "../screens/ProcedureDetailsScreen";
import PhotoComparisonScreen from "../screens/PhotoComparisonScreen";
import PremiumUpgradeScreen from "../screens/PremiumUpgradeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={GRADIENTS.background}
      style={StyleSheet.absoluteFill}
    />
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

// Custom Tab Bar Component
const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const handleAddPress = () => {
    navigation.navigate("AddProcedure");
  };

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarBackground}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
            if (route.name === "Home") {
              iconName = isFocused ? "home" : "home-outline";
            } else if (route.name === "Profile") {
              iconName = isFocused ? "person" : "person-outline";
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? COLORS.primary : COLORS.mutedText}
                />
                <View
                  style={[
                    styles.tabIndicator,
                    isFocused && styles.tabIndicatorActive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={handleAddPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Main Tabs Navigator
const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const hasSeenOnboarding = useSettingsStore(
    (state) => state.hasSeenOnboarding
  );
  const { session, isLoading, isInitialized, initialize, user, isGuest } =
    useAuthStore();
  const { guestUserId, initializeGuest, isGuestMode } = useGuestStore();
  const fetchProcedures = useProcedureStore((state) => state.fetchProcedures);
  const navigationRef = useRef<any>(null);

  // Initialize auth and guest on mount
  useEffect(() => {
    const initAuth = async () => {
      await initialize();
      // Only initialize guest mode if no session exists
      // This is handled in GoogleSignInScreen when user chooses guest mode
    };
    initAuth();
  }, []);

  // Fetch procedures when user is authenticated or in guest mode
  useEffect(() => {
    if (isInitialized) {
      const currentUserId =
        user?.id || (isGuestMode && guestUserId ? guestUserId : null);
      if (currentUserId) {
        fetchProcedures(currentUserId).catch((error) => {
          console.error("Failed to fetch procedures on app init:", error);
        });
      }
    }
  }, [isInitialized, user?.id, guestUserId, isGuestMode, fetchProcedures]);

  // Navigate based on auth state changes
  useEffect(() => {
    if (!isInitialized || !navigationRef.current) {
      return;
    }

    const navigateToCorrectScreen = () => {
      if (!hasSeenOnboarding) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Onboarding" }],
        });
        return;
      }

      // If authenticated, go to MainTabs
      if (session) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
        return;
      }

      // If guest mode, go to MainTabs
      if (isGuestMode && guestUserId) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
        return;
      }

      // Otherwise, go to sign-in
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "GoogleSignIn" }],
      });
    };

    navigateToCorrectScreen();
  }, [isInitialized, hasSeenOnboarding, session, isGuestMode, guestUserId]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Determine initial route
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!hasSeenOnboarding) {
      return "Onboarding";
    }
    // Allow access to MainTabs if authenticated OR in guest mode
    if (session || (isGuestMode && guestUserId)) {
      return "MainTabs";
    }
    return "GoogleSignIn";
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="GoogleSignIn"
          component={GoogleSignInScreen}
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabsNavigator}
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="AddProcedure"
          component={AddProcedureScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="ProcedureDetails"
          component={ProcedureDetailsScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="PhotoComparison"
          component={PhotoComparisonScreen}
          options={{
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="PremiumUpgrade"
          component={PremiumUpgradeScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBackground: {
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  tabBar: {
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: SIZES.xl,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.sm,
  },
  tabLabel: {
    fontSize: SIZES.fontXs,
    marginTop: 4,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 4,
  },
  tabIndicatorActive: {
    backgroundColor: COLORS.primary,
  },
  fabContainer: {
    position: "absolute",
    top: -28,
    alignSelf: "center",
    ...SHADOWS.large,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppNavigator;
