// Procedure Details Screen

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";
import {
  formatDate,
  formatCurrency,
  getCategoryById,
  getReminderIntervalLabel,
} from "../data/mockData";
import CategoryIcon from "../components/CategoryIcon";
import Button from "../components/Button";
import { useProcedureStore } from "../store/useProcedureStore";
import { useAuthStore } from "../store/useAuthStore";
import { ActivityIndicator } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProcedureDetailsScreenProps {
  navigation: any;
  route: any;
}

const ProcedureDetailsScreen: React.FC<ProcedureDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { procedureId } = route.params;
  const deleteProcedure = useProcedureStore((state) => state.deleteProcedure);
  // Subscribe to procedures array so component re-renders when store updates
  const procedures = useProcedureStore((state) => state.procedures);
  const { user } = useAuthStore();

  // Get procedure from the subscribed procedures array - this will update automatically
  const procedure = procedures.find((p) => p.id === procedureId);
  const categoryInfo = procedure ? getCategoryById(procedure.category) : null;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Force re-render when screen comes into focus to ensure latest data is displayed
  useFocusEffect(
    useCallback(() => {
      // Component will automatically re-render because we're subscribed to procedures array
      // This callback ensures we're ready to display updated data
    }, [])
  );

  if (!procedure) {
    return (
      <View style={styles.container}>
        <Text>Procedure not found</Text>
      </View>
    );
  }

  const beforePhotos = procedure.photos.filter((p) => p.tag === "before");
  const afterPhotos = procedure.photos.filter((p) => p.tag === "after");
  const hasComparison = beforePhotos.length > 0 && afterPhotos.length > 0;

  const handleEdit = () => {
    navigation.navigate("AddProcedure", { procedureId: procedure.id });
  };

  const handleDelete = () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to delete procedures.");
      return;
    }

    Alert.alert(
      "Delete Procedure",
      "Are you sure you want to delete this procedure? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteProcedure(procedureId, user.id);
              navigation.goBack();
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Failed to delete procedure. Please try again.";
              Alert.alert("Error", errorMessage);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCompare = () => {
    navigation.navigate("PhotoComparison", { procedureId: procedure.id });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar barStyle="light-content" />

      {/* Photo Gallery Header */}
      <View style={styles.photoHeader}>
        {procedure.photos.length > 0 ? (
          <>
            <ScrollView
              horizontal={true}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setActivePhotoIndex(index);
              }}
            >
              {procedure.photos.map((photo, index) => (
                <Image
                  key={photo.id}
                  source={{ uri: photo.uri }}
                  style={styles.headerPhoto}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Photo Tag Badge */}
            {procedure.photos[activePhotoIndex] && (
              <View style={styles.photoTagBadge}>
                <Text style={styles.photoTagText}>
                  {procedure.photos[activePhotoIndex].tag === "before"
                    ? "Before"
                    : "After"}
                </Text>
              </View>
            )}

            {/* Pagination Dots */}
            {procedure.photos.length > 1 && (
              <View style={styles.paginationDots}>
                {procedure.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activePhotoIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noPhotoPlaceholder}>
            <Ionicons
              name="camera-outline"
              size={48}
              color={COLORS.mutedText}
            />
            <Text style={styles.noPhotoText}>No photos yet</Text>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + SIZES.sm }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.darkText} />
        </TouchableOpacity>

        {/* Actions Button */}
        <TouchableOpacity
          style={[styles.actionsButton, { top: insets.top + SIZES.sm }]}
          onPress={() => {}}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={COLORS.darkText}
          />
        </TouchableOpacity>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", COLORS.background]}
          style={styles.headerGradient}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.procedureName}>{procedure.name}</Text>
          <View style={styles.categoryRow}>
            <CategoryIcon category={procedure.category} size="small" />
            <Text style={styles.categoryText}>{categoryInfo?.name}</Text>
          </View>
        </View>

        {/* Compare Button */}
        {hasComparison && (
          <TouchableOpacity
            style={styles.compareButton}
            onPress={handleCompare}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.compareButtonGradient}
            >
              <Ionicons name="git-compare-outline" size={20} color="#FFFFFF" />
              <Text style={styles.compareButtonText}>
                Compare Before & After
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(procedure.date)}
              </Text>
            </View>
          </View>

          {/* Clinic */}
          {procedure.clinic && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Provider</Text>
                <Text style={styles.detailValue}>{procedure.clinic}</Text>
              </View>
            </View>
          )}

          {/* Product */}
          {procedure.productBrand && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="flask-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Product</Text>
                <Text style={styles.detailValue}>{procedure.productBrand}</Text>
              </View>
            </View>
          )}

          {/* Cost */}
          {procedure.cost && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Cost</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(procedure.cost)}
                </Text>
              </View>
            </View>
          )}

          {/* Reminder */}
          {procedure.reminder && (
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Reminder</Text>
                <Text style={styles.detailValue}>
                  {getReminderIntervalLabel(procedure.reminder.interval)} -{" "}
                  {formatDate(procedure.reminder.nextDate)}
                </Text>
              </View>
              <View
                style={[
                  styles.reminderBadge,
                  procedure.reminder.enabled
                    ? styles.reminderBadgeActive
                    : styles.reminderBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.reminderBadgeText,
                    procedure.reminder.enabled
                      ? styles.reminderBadgeTextActive
                      : styles.reminderBadgeTextInactive,
                  ]}
                >
                  {procedure.reminder.enabled ? "Active" : "Off"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {procedure.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{procedure.notes}</Text>
          </View>
        )}

        {/* Photo Gallery */}
        {procedure.photos.length > 0 && (
          <View style={styles.gallerySection}>
            <Text style={styles.gallerySectionTitle}>Photo Gallery</Text>
            <View style={styles.galleryGrid}>
              {procedure.photos.map((photo, index) => (
                <TouchableOpacity key={photo.id} style={styles.galleryItem}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.galleryPhoto}
                    resizeMode="cover"
                  />
                  <View style={styles.galleryPhotoTag}>
                    <Text style={styles.galleryPhotoTagText}>
                      {photo.tag === "before" ? "B" : "A"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoHeader: {
    height: 300,
    backgroundColor: COLORS.inputBackground,
  },
  headerPhoto: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  photoTagBadge: {
    position: "absolute",
    bottom: 60,
    left: SIZES.lg,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  photoTagText: {
    color: "#FFF",
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  paginationDots: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#FFF",
    width: 24,
  },
  noPhotoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPhotoText: {
    marginTop: SIZES.sm,
    fontSize: SIZES.fontMd,
    color: COLORS.mutedText,
  },
  backButton: {
    position: "absolute",
    left: SIZES.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  actionsButton: {
    position: "absolute",
    right: SIZES.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
  },
  titleSection: {
    marginBottom: SIZES.lg,
  },
  procedureName: {
    fontSize: SIZES.fontXxl,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: SIZES.xs,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: SIZES.fontMd,
    color: COLORS.lightText,
    marginLeft: SIZES.sm,
  },
  compareButton: {
    borderRadius: SIZES.radiusLg,
    overflow: "hidden",
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  compareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.md,
  },
  compareButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.darkText,
    marginLeft: SIZES.sm,
  },
  detailsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
  },
  detailValue: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.darkText,
    marginTop: 2,
  },
  reminderBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  reminderBadgeActive: {
    backgroundColor: `${COLORS.success}20`,
  },
  reminderBadgeInactive: {
    backgroundColor: COLORS.border,
  },
  reminderBadgeText: {
    fontSize: SIZES.fontXs,
    fontWeight: "600",
  },
  reminderBadgeTextActive: {
    color: COLORS.success,
  },
  reminderBadgeTextInactive: {
    color: COLORS.mutedText,
  },
  notesCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  notesLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginBottom: SIZES.sm,
  },
  notesText: {
    fontSize: SIZES.fontMd,
    color: COLORS.darkText,
    lineHeight: 22,
  },
  gallerySection: {
    marginBottom: SIZES.lg,
  },
  gallerySectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
    color: COLORS.darkText,
    marginBottom: SIZES.md,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
  },
  galleryItem: {
    width: (SCREEN_WIDTH - SIZES.lg * 2 - SIZES.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: SIZES.radiusMd,
    overflow: "hidden",
  },
  galleryPhoto: {
    width: "100%",
    height: "100%",
  },
  galleryPhotoTag: {
    position: "absolute",
    top: SIZES.xs,
    left: SIZES.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryPhotoTagText: {
    color: "#FFF",
    fontSize: SIZES.fontXs,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: SIZES.sm,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.error,
    marginLeft: SIZES.sm,
  },
});

export default ProcedureDetailsScreen;
