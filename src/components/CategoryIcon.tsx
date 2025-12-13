// Category Icon Component

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { COLORS, SIZES } from '../constants/theme';
import { getCategoryById } from '../data/mockData';

interface CategoryIconProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 'medium',
  showBackground = true,
}) => {
  const categoryInfo = getCategoryById(category);
  
  const sizeMap = {
    small: { icon: 16, container: 28 },
    medium: { icon: 20, container: 36 },
    large: { icon: 28, container: 48 },
  };

  const { icon: iconSize, container: containerSize } = sizeMap[size];

  if (!categoryInfo) return null;

  const iconName = categoryInfo.icon as keyof typeof Ionicons.glyphMap;

  if (!showBackground) {
    return (
      <Ionicons 
        name={iconName}
        size={iconSize} 
        color={categoryInfo.color} 
      />
    );
  }

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: containerSize, 
          height: containerSize,
          backgroundColor: `${categoryInfo.color}20`,
        }
      ]}
    >
      <Ionicons 
        name={iconName}
        size={iconSize} 
        color={categoryInfo.color} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryIcon;

