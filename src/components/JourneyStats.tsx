// Journey Stats Component

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";

interface JourneyStatsProps {
  procedureCount: number;
  photoCount: number;
  reminderCount: number;
}

const JourneyStats: React.FC<JourneyStatsProps> = ({
  procedureCount,
  photoCount,
  reminderCount,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.title}>Your Journey</Text>
            <Text style={styles.subtitle}>Track your beauty evolution</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{procedureCount}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Procedures
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{photoCount}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Photos
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{reminderCount}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Reminders
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    overflow: "hidden",
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.small,
  },
  gradient: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  title: {
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZES.md,
  },
  statItem: {
    flex: 1,
  },
  statBox: {
    backgroundColor: COLORS.lightPeach,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  statNumber: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  statLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.lightText,
    marginTop: 4,
    textAlign: "center",
    overflow: "hidden",
  },
});

export default JourneyStats;
