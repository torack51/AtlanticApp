import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';

const ScrollingText = ({ text, speed = 30, containerWidth, spacing = 20 }) => {
  const [contentWidth, setContentWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (contentWidth > 0 && containerWidth > 0) {
      const totalContentWidth = contentWidth * 2 + spacing; // Largeur totale avec l'espacement
      const duration = (totalContentWidth / speed) * 1000;

      Animated.loop(
        Animated.timing(scrollX, {
          toValue: -contentWidth - spacing,
          duration: duration,
          useNativeDriver: true,
          delay: 1000,
        }),
        { iterations: -1 }
      ).start();

      scrollX.addListener(({ value }) => {
        if (value <= -contentWidth - spacing) {
          scrollX.setValue(0);
        }
      });
    }

    return () => {
      scrollX.removeAllListeners();
      scrollX.stopAnimation();
    };
  }, [contentWidth, containerWidth, speed, spacing, scrollX]);

  const handleTextLayout = (event: any) => {
    setContentWidth(event.nativeEvent.layout.width);
  };

  const translateX = scrollX.interpolate({
    inputRange: [-contentWidth - spacing, 0],
    outputRange: [-(contentWidth + spacing), 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { width: containerWidth, overflow: 'hidden' }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ transform: [{ translateX }] }}
        onContentSizeChange={(width) => setContentWidth(width)}
      >
        <Text style={styles.text} onLayout={handleTextLayout}>
          {text}
        </Text>
        <Text style={[styles.text, { marginLeft: spacing }]} onLayout={handleTextLayout}>
          {text}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    whiteSpace: 'nowrap', // Important pour éviter le retour à la ligne
  },
});

export default ScrollingText;