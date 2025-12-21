// Photo Comparison Screen - Before/After Slider

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { useProcedureStore } from "../store/useProcedureStore";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PhotoComparisonScreenProps {
  navigation: any;
  route: any;
}

const PhotoComparisonScreen: React.FC<PhotoComparisonScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { procedureId } = route.params;
  const getProcedureById = useProcedureStore((state) => state.getProcedureById);

  const procedure = getProcedureById(procedureId);

  const beforePhoto = procedure?.photos.find((p) => p.tag === "before");
  const afterPhoto = procedure?.photos.find((p) => p.tag === "after");

  const [sliderPosition, setSliderPosition] = useState(SCREEN_WIDTH / 2);
  const sliderAnim = useRef(new Animated.Value(SCREEN_WIDTH / 2)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPosition = Math.max(
          50,
          Math.min(SCREEN_WIDTH - 50, gestureState.moveX)
        );
        sliderAnim.setValue(newPosition);
        setSliderPosition(newPosition);
      },
    })
  ).current;

  if (!procedure || !beforePhoto || !afterPhoto) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Photos not available for comparison
        </Text>
      </View>
    );
  }

  const imageHeight = SCREEN_HEIGHT - insets.top - insets.bottom - 150;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Comparison View */}
      <View style={[styles.comparisonContainer, { height: imageHeight }]}>
        {/* After Image (Full) */}
        <Image
          source={{ uri: afterPhoto.uri }}
          style={[styles.image, { height: imageHeight }]}
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
            source={{ uri: beforePhoto.uri }}
            style={[styles.image, styles.beforeImage, { height: imageHeight }]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Slider */}
        <Animated.View
          style={[
            styles.sliderContainer,
            { left: Animated.subtract(sliderAnim, 20) },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderLine} />
          <View style={styles.sliderHandle}>
            <View style={styles.sliderArrows}>
              <Ionicons name="chevron-back" size={16} color={COLORS.darkText} />
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.darkText}
              />
            </View>
          </View>
          <View style={styles.sliderLine} />
        </Animated.View>

        {/* Labels */}
        <View style={styles.labelContainer}>
          <View style={[styles.label, styles.labelBefore]}>
            <Text style={styles.labelText}>Before</Text>
          </View>
          <View style={[styles.label, styles.labelAfter]}>
            <Text style={styles.labelText}>After</Text>
          </View>
        </View>
      </View>

      {/* Procedure Info */}
      <View
        style={[styles.infoBar, { paddingBottom: insets.bottom + SIZES.md }]}
      >
        <Text style={styles.procedureName}>{procedure.name}</Text>
        <Text style={styles.procedureDate}>
          {procedure.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Ionicons name="hand-left-outline" size={16} color={COLORS.mutedText} />
        <Text style={styles.instructionsText}>Drag the slider to compare</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
    color: "#FFF",
  },
  placeholder: {
    width: 40,
  },
  comparisonContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: SCREEN_WIDTH,
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
  sliderContainer: {
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
    backgroundColor: "#FFF",
    ...SHADOWS.medium,
  },
  sliderHandle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.large,
  },
  sliderArrows: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelContainer: {
    position: "absolute",
    top: SIZES.lg,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.lg,
  },
  label: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  labelBefore: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  labelAfter: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  labelText: {
    color: "#FFF",
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  infoBar: {
    backgroundColor: "#111",
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    alignItems: "center",
  },
  procedureName: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
    color: "#FFF",
  },
  procedureDate: {
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
    marginTop: 4,
  },
  instructions: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
  },
  instructionsText: {
    color: COLORS.mutedText,
    fontSize: SIZES.fontSm,
    marginLeft: SIZES.xs,
  },
  errorText: {
    color: "#FFF",
    fontSize: SIZES.fontMd,
    textAlign: "center",
    marginTop: 100,
  },
});

export default PhotoComparisonScreen;
