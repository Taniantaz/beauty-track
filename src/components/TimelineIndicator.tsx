// Timeline Indicator Component - Positioned between cards

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface TimelineIndicatorProps {
  isFirst?: boolean;
  isLast?: boolean;
}

const TimelineIndicator: React.FC<TimelineIndicatorProps> = ({ 
  isFirst = false, 
  isLast = false 
}) => {
  return (
    <View style={styles.container}>
      {/* Left line */}
      <View style={styles.line} />
      
      {/* Center Dot */}
      <View style={styles.dotOuter}>
        <View style={styles.dotInner} />
      </View>
      
      {/* Right line */}
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    marginVertical: SIZES.xs,
  },
  line: {
    height: 2,
    flex: 1,
    backgroundColor: COLORS.primary,
    maxWidth: 60,
    opacity: 0.2,
  },
  dotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.softLavender,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.sm,
    opacity: 0.6,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    opacity: 0.4,
  },
});

export default TimelineIndicator;

