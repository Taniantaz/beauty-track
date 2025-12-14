// Add Procedure Screen

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SIZES, SHADOWS, GRADIENTS } from "../constants/theme";
import { CATEGORIES, PROCEDURE_SUGGESTIONS } from "../data/mockData";
import { Category, PhotoTag, ReminderInterval } from "../types";
import Button from "../components/Button";
import { useProcedureStore } from "../store/useProcedureStore";
import { useAuthStore } from "../store/useAuthStore";
import { calculateReminderNextDate } from "../services/procedureService";
import { ActivityIndicator } from "react-native";

interface AddProcedureScreenProps {
  navigation: any;
  route: any;
}

const REMINDER_OPTIONS = [
  { id: "30days", label: "30 Days" },
  { id: "90days", label: "90 Days" },
  { id: "6months", label: "6 Months" },
  { id: "1year", label: "1 Year" },
  { id: "custom", label: "Custom" },
];

const AddProcedureScreen: React.FC<AddProcedureScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = route?.params?.procedureId;
  const { addProcedure, updateProcedure, getProcedureById, isLoading } =
    useProcedureStore();
  const { user } = useAuthStore();

  const [procedureName, setProcedureName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("face");
  const [date, setDate] = useState(new Date());
  const [clinic, setClinic] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [existingPhotoUris, setExistingPhotoUris] = useState<Set<string>>(new Set());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState("90days");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load procedure data if editing
  useEffect(() => {
    if (isEditing) {
      const procedure = getProcedureById(isEditing);
      if (procedure) {
        setProcedureName(procedure.name);
        setSelectedCategory(procedure.category);
        setDate(procedure.date);
        setClinic(procedure.clinic || "");
        setCost(procedure.cost?.toString() || "");
        setNotes(procedure.notes || "");
        setProductBrand(procedure.productBrand || "");
        const beforeUris = procedure.photos.filter((p) => p.tag === "before").map((p) => p.uri);
        const afterUris = procedure.photos.filter((p) => p.tag === "after").map((p) => p.uri);
        setBeforePhotos(beforeUris);
        setAfterPhotos(afterUris);
        // Track existing photo URIs (these are URLs from Supabase, not local files)
        const existingUris = new Set([...beforeUris, ...afterUris]);
        setExistingPhotoUris(existingUris);
        setReminderEnabled(procedure.reminder?.enabled ?? true);
        setReminderInterval(procedure.reminder?.interval || "90days");
      }
    }
  }, [isEditing, getProcedureById]);

  const filteredSuggestions = PROCEDURE_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(procedureName.toLowerCase())
  ).slice(0, 5);

  const pickImage = async (type: PhotoTag) => {
    try {
      console.log('pickImage called for type:', type);
      
      // Request permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      console.log('Permission result:', permissionResult);

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library."
        );
        return;
      }

      console.log('Launching image library...');
      
      // Launch image picker
      // Omit mediaTypes - images is the default type
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log('Selected image URI:', selectedImage.uri);
        
        if (type === "before") {
          setBeforePhotos([...beforePhotos, selectedImage.uri]);
        } else {
          setAfterPhotos([...afterPhotos, selectedImage.uri]);
        }
      } else {
        console.log('Image picker was canceled or no image selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        "Error",
        error instanceof Error 
          ? error.message 
          : "Failed to open image picker. Please try again."
      );
    }
  };

  const removePhoto = (type: PhotoTag, index: number) => {
    if (type === "before") {
      setBeforePhotos(beforePhotos.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(afterPhotos.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!procedureName.trim()) {
      Alert.alert("Required", "Please enter a procedure name.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to save procedures.");
      return;
    }

    if (saving) {
      return; // Prevent double submission
    }

    setSaving(true);

    try {
      // Prepare photo data for upload
      // Only upload new photos (local file URIs), not existing ones (URLs from Supabase)
      const isLocalFile = (uri: string) => {
        return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
      };
      
      const photoData = [
        ...beforePhotos
          .filter((uri) => isLocalFile(uri) && !existingPhotoUris.has(uri))
          .map((uri) => ({
            uri,
            tag: "before" as const,
          })),
        ...afterPhotos
          .filter((uri) => isLocalFile(uri) && !existingPhotoUris.has(uri))
          .map((uri) => ({
            uri,
            tag: "after" as const,
          })),
      ];

      // Prepare procedure data
      const procedureData = {
        name: procedureName.trim(),
        category: selectedCategory,
        date,
        clinic: clinic.trim() || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        notes: notes.trim() || undefined,
        productBrand: productBrand.trim() || undefined,
      };

      // Calculate reminder data
      let reminderData;
      if (reminderEnabled) {
        const nextDate = calculateReminderNextDate(
          reminderInterval as ReminderInterval,
          date
        );
        reminderData = {
          interval: reminderInterval as ReminderInterval,
          nextDate,
          enabled: true,
        };
      }

      if (isEditing) {
        // For updates, only upload new photos (existing photos are already in DB)
        await updateProcedure(
          isEditing,
          user.id,
          procedureData,
          photoData,
          reminderData
        );
      } else {
        await addProcedure(user.id, procedureData, photoData, reminderData);
      }

      navigation.goBack();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save procedure. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
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
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Procedure" : "Add Procedure"}
        </Text>
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
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Procedure Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Procedure Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={COLORS.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g., Lip Filler, Botox"
              placeholderTextColor={COLORS.mutedText}
              value={procedureName}
              onChangeText={(text) => {
                setProcedureName(text);
                setShowSuggestions(text.length > 0);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </View>

          {/* Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {filteredSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setProcedureName(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id &&
                    styles.categoryItemSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${category.color}20` },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.inputContainer}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.mutedText}
              style={styles.inputIcon}
            />
            <Text style={styles.dateText}>{formatDateDisplay(date)}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.mutedText} />
          </TouchableOpacity>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <View style={styles.photosRow}>
            {/* Before Photos */}
            <View style={styles.photoColumn}>
              <Text style={styles.photoLabel}>Before</Text>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => pickImage("before")}
                activeOpacity={0.7}
              >
                {beforePhotos.length > 0 ? (
                  <Image
                    source={{ uri: beforePhotos[0] }}
                    style={styles.photoPreview}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={32}
                      color={COLORS.mutedText}
                    />
                    <Text style={styles.photoUploadText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* After Photos */}
            <View style={styles.photoColumn}>
              <Text style={styles.photoLabel}>After</Text>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => pickImage("after")}
                activeOpacity={0.7}
              >
                {afterPhotos.length > 0 ? (
                  <Image
                    source={{ uri: afterPhotos[0] }}
                    style={styles.photoPreview}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={32}
                      color={COLORS.mutedText}
                    />
                    <Text style={styles.photoUploadText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Optional Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>Clinic / Provider (optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="business-outline"
              size={20}
              color={COLORS.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g., Glow Aesthetics"
              placeholderTextColor={COLORS.mutedText}
              value={clinic}
              onChangeText={setClinic}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Product / Brand (optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="flask-outline"
              size={20}
              color={COLORS.mutedText}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g., Juvederm, Botox"
              placeholderTextColor={COLORS.mutedText}
              value={productBrand}
              onChangeText={setProductBrand}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cost (optional)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.mutedText}
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any notes about the procedure..."
              placeholderTextColor={COLORS.mutedText}
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Reminder */}
        <View style={styles.section}>
          <View style={styles.reminderHeader}>
            <View>
              <Text style={styles.label}>Maintenance Reminder</Text>
              <Text style={styles.reminderSubtext}>
                Get notified for your next touch-up
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.reminderToggle,
                reminderEnabled && styles.reminderToggleActive,
              ]}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <View
                style={[
                  styles.reminderToggleThumb,
                  reminderEnabled && styles.reminderToggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {reminderEnabled && (
            <View style={styles.reminderOptions}>
              {REMINDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.reminderOption,
                    reminderInterval === option.id &&
                      styles.reminderOptionSelected,
                  ]}
                  onPress={() => setReminderInterval(option.id)}
                >
                  <Text
                    style={[
                      styles.reminderOptionText,
                      reminderInterval === option.id &&
                        styles.reminderOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + SIZES.md }]}
      >
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.9}
          disabled={saving || isLoading}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {saving || isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Save Changes" : "Add Procedure"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  closeButton: {
    position: "absolute",
    right: SIZES.lg,
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    color: COLORS.darkText,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.darkText,
  },
  currencySymbol: {
    fontSize: SIZES.fontMd,
    color: COLORS.mutedText,
    marginRight: SIZES.xs,
  },
  textAreaContainer: {
    height: 120,
    alignItems: "flex-start",
    paddingVertical: SIZES.md,
  },
  textArea: {
    height: "100%",
  },
  dateText: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.darkText,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusMd,
    marginTop: SIZES.xs,
    ...SHADOWS.medium,
  },
  suggestionItem: {
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: SIZES.fontMd,
    color: COLORS.darkText,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
  },
  categoryItem: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.sm,
  },
  categoryItemSelected: {
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.xs,
  },
  categoryText: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    textAlign: "center",
  },
  categoryTextSelected: {
    color: COLORS.darkText,
    fontWeight: "600",
  },
  photosRow: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  photoColumn: {
    flex: 1,
  },
  photoLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  photoUpload: {
    aspectRatio: 0.85,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoUploadText: {
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
    marginTop: SIZES.sm,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderSubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginTop: 2,
  },
  reminderToggle: {
    width: 52,
    height: 32,
    backgroundColor: COLORS.border,
    borderRadius: 16,
    padding: 3,
  },
  reminderToggleActive: {
    backgroundColor: COLORS.primary,
  },
  reminderToggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 13,
  },
  reminderToggleThumbActive: {
    marginLeft: "auto",
  },
  reminderOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginTop: SIZES.md,
  },
  reminderOption: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reminderOptionSelected: {
    borderColor: COLORS.primary,
  },
  reminderOptionText: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
  },
  reminderOptionTextSelected: {
    color: COLORS.darkText,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    borderRadius: SIZES.radiusLg,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SIZES.md,
  },
  saveButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
    color: COLORS.darkText,
    marginLeft: SIZES.sm,
  },
});

export default AddProcedureScreen;
