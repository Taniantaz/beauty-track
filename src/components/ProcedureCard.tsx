// Procedure Card Component

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Procedure } from '../types';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatDate, getCategoryById } from '../data/mockData';
import CategoryIcon from './CategoryIcon';

interface ProcedureCardProps {
  procedure: Procedure;
  onPress: () => void;
  index: number;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({ 
  procedure, 
  onPress,
  index,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const categoryInfo = getCategoryById(procedure.category);
  
  const thumbnailPhoto = procedure.photos.find(p => p.tag === 'after') || procedure.photos[0];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={styles.card}>
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            {thumbnailPhoto ? (
              <Image 
                source={{ uri: thumbnailPhoto.uri }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Ionicons 
                  name="camera-outline" 
                  size={24} 
                  color={COLORS.mutedText} 
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>
              {procedure.name}
            </Text>
            
            <View style={styles.categoryRow}>
              <CategoryIcon category={procedure.category} size="small" />
              <Text style={styles.categoryText}>
                {categoryInfo?.name}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={COLORS.mutedText} 
              />
              <Text style={styles.dateText}>
                {formatDate(procedure.date)}
              </Text>
              {procedure.reminder?.enabled && (
                <>
                  <Ionicons 
                    name="notifications-outline" 
                    size={14} 
                    color={COLORS.primary} 
                    style={styles.reminderIcon}
                  />
                  <Text style={styles.reminderText}>
                    Reminder set
                  </Text>
                </>
              )}
            </View>

            {procedure.clinic && (
              <Text style={styles.clinicText} numberOfLines={1}>
                {procedure.clinic}
              </Text>
            )}
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={COLORS.mutedText} 
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  touchable: {
    borderRadius: SIZES.radiusLg,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    backgroundColor: COLORS.inputBackground,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.softLavender,
  },
  content: {
    flex: 1,
    marginLeft: SIZES.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginLeft: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: SIZES.fontSm,
    color: COLORS.mutedText,
    marginLeft: 4,
  },
  reminderIcon: {
    marginLeft: 12,
  },
  reminderText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    marginLeft: 4,
  },
  clinicText: {
    fontSize: SIZES.fontSm,
    color: COLORS.lightText,
    marginTop: 4,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: SIZES.sm,
  },
});

export default ProcedureCard;

