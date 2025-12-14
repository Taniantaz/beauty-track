// Login Prompt Modal - Shown when guest reaches 3-entry limit

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';

interface LoginPromptModalProps {
  visible: boolean;
  onCreateAccount: () => void;
  onMaybeLater: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  visible,
  onCreateAccount,
  onMaybeLater,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onMaybeLater}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom + SIZES.lg }]}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="shield-checkmark"
                  size={48}
                  color={COLORS.primary}
                />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Save your timeline</Text>

            {/* Body */}
            <Text style={styles.body}>
              Guest mode is limited to 3 entries.{'\n\n'}
              Create a free account to securely save your timeline and continue.
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Primary CTA */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onCreateAccount}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Create free account</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary CTA */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onMaybeLater}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    ...SHADOWS.large,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.fontXxl,
    fontWeight: '700',
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  body: {
    fontSize: SIZES.fontMd,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.xl,
    paddingHorizontal: SIZES.sm,
  },
  buttonContainer: {
    gap: SIZES.md,
  },
  primaryButton: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  primaryButtonGradient: {
    paddingVertical: SIZES.md + 4,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

