// Button Component

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, GRADIENTS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: SIZES.fontSm,
      iconSize: 16,
    },
    medium: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      fontSize: SIZES.fontMd,
      iconSize: 20,
    },
    large: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      fontSize: SIZES.fontLg,
      iconSize: 24,
    },
  };

  const { paddingVertical, paddingHorizontal, fontSize, iconSize } = sizeStyles[size];

  const getTextColor = () => {
    if (disabled) return COLORS.mutedText;
    switch (variant) {
      case 'primary':
        return '#FFFFFF'; // White text on gradient
      case 'secondary':
        return COLORS.warmCocoa; // Warm cocoa text on warm gradient
      case 'outline':
        return COLORS.primary;
      case 'ghost':
        return COLORS.primary;
      default:
        return '#FFFFFF';
    }
  };

  const renderContent = () => (
    <Animated.View 
      style={[
        styles.contentContainer,
        { 
          paddingVertical, 
          paddingHorizontal,
          transform: [{ scale: scaleAnim }],
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={iconSize} 
              color={getTextColor()} 
              style={styles.iconLeft}
            />
          )}
          <Text 
            style={[
              styles.text, 
              { fontSize, color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={iconSize} 
              color={getTextColor()} 
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Animated.View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={disabled ? [COLORS.mutedText, COLORS.mutedText] : GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, fullWidth && styles.fullWidth]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={disabled ? [COLORS.mutedText, COLORS.mutedText] : GRADIENTS.secondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, fullWidth && styles.fullWidth]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radiusFull,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: SIZES.radiusFull,
    ...SHADOWS.small,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;

