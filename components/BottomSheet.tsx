
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { colors } from '../styles/commonStyles';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const SNAP_POINTS = [0, 300, 500]; // Closed, Half, Full
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SimpleBottomSheet({ children, isVisible = false, onClose }: SimpleBottomSheetProps) {
  const [visible, setVisible] = useState(isVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      snapToPoint(300); // Open to half height
    } else {
      snapToPoint(0); // Close
      setTimeout(() => setVisible(false), 300);
    }
  }, [isVisible]);

  const snapToPoint = (point: number) => {
    const toValue = point === 0 ? SCREEN_HEIGHT : SCREEN_HEIGHT - point;
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: point === 0 ? 0 : 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (point === 0 && onClose) {
        onClose();
      }
    });
  };

  const handleBackdropPress = () => {
    snapToPoint(0);
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number) => {
    const currentPoint = SCREEN_HEIGHT - currentY;
    
    if (velocityY > 500) return 0; // Fast swipe down
    if (velocityY < -500) return 500; // Fast swipe up
    
    // Find closest snap point
    return SNAP_POINTS.reduce((prev, curr) => 
      Math.abs(curr - currentPoint) < Math.abs(prev - currentPoint) ? curr : prev
    );
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      const currentY = SCREEN_HEIGHT - 300 + translationY;
      const snapPoint = getClosestSnapPoint(currentY, velocityY);
      snapToPoint(snapPoint);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]} 
          />
        </TouchableWithoutFeedback>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY }] }
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    maxHeight: SCREEN_HEIGHT * 0.8,
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
