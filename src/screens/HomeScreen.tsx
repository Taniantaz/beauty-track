// Home Screen - Procedure Timeline

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";
import ProcedureCard from "../components/ProcedureCard";
import TimelineIndicator from "../components/TimelineIndicator";
import JourneyStats from "../components/JourneyStats";
import AnimatedScreen from "../components/AnimatedScreen";
import { Procedure } from "../types";
import { useProcedureStore } from "../store/useProcedureStore";
import { useUserStore } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const procedures = useProcedureStore((state) => state.procedures);
  const isLoading = useProcedureStore((state) => state.isLoading);
  const fetchProcedures = useProcedureStore((state) => state.fetchProcedures);
  const user = useUserStore((state) => state.user);
  const { user: authUser } = useAuthStore();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Fetch procedures on mount
  useEffect(() => {
    if (authUser?.id) {
      fetchProcedures(authUser.id).catch((error) => {
        console.error("Failed to fetch procedures:", error);
      });
    }
  }, [authUser?.id, fetchProcedures]);

  const onRefresh = useCallback(async () => {
    if (!authUser?.id) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    try {
      await fetchProcedures(authUser.id);
    } catch (error) {
      console.error("Failed to refresh procedures:", error);
    } finally {
      setRefreshing(false);
    }
  }, [authUser?.id, fetchProcedures]);

  const reminderCount = procedures.filter((p) => p.reminder?.enabled).length;
  const photoCount = procedures.reduce((acc, p) => acc + p.photos.length, 0);

  const handleProcedurePress = (procedure: Procedure) => {
    navigation.navigate("ProcedureDetails", { procedureId: procedure.id });
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  return (
    <AnimatedScreen direction="right">
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
        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + SIZES.md, opacity: headerOpacity },
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.header}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.nameRow}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>Your Timeline</Text>
                  <Text style={styles.sparkle}> ✨</Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
                  <Ionicons
                    name="search-outline"
                    size={24}
                    color={COLORS.darkText}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={COLORS.darkText}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Content */}
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Journey Stats */}
          <JourneyStats
            procedureCount={procedures.length}
            photoCount={photoCount}
            reminderCount={reminderCount}
          />

          {/* Timeline Section */}
          <View style={styles.timelineSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Entries</Text>
              <Text style={styles.procedureCount}>
                {procedures.length} procedures
              </Text>
            </View>

            {/* Timeline List */}
            {isLoading && !refreshing && procedures.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <>
                <View style={styles.timeline}>
                  {procedures.map((procedure, index) => (
                    <View key={procedure.id}>
                      <ProcedureCard
                        procedure={procedure}
                        onPress={() => handleProcedurePress(procedure)}
                        index={index}
                      />
                      {/* Show timeline indicator between cards, not after the last one */}
                      {index < procedures.length - 1 && <TimelineIndicator />}
                    </View>
                  ))}
                </View>

                {procedures.length === 0 && !isLoading && (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                      <Ionicons
                        name="flower-outline"
                        size={48}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.emptyTitle}>Start Your Journey</Text>
                    <Text style={styles.emptyText}>
                      Tap the + button to log your first{"\n"}cosmetic procedure
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: SIZES.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.lg,
  },
  welcomeText: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontSize: SIZES.fontXxl,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  sparkle: {
    fontSize: SIZES.fontXl,
  },
  headerActions: {
    flexDirection: "row",
    gap: SIZES.sm,
  },
  iconButton: {
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
    paddingTop: 120,
  },
  timelineSection: {
    paddingHorizontal: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  procedureCount: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
  },
  timeline: {
    // Cards now take full width with timeline indicators between them
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SIZES.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.softLavender,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  emptyTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
    color: COLORS.darkText,
    marginBottom: SIZES.sm,
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.lightText,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    paddingVertical: SIZES.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
