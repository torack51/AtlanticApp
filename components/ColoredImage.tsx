import React, { useState, useEffect } from 'react';
import { Image, View, Button } from 'react-native';
import { ColorMatrix, concatColorMatrices, ColorMatrixType } from 'react-native-color-matrix-image-filters';

const getDesaturationMatrix = (): ColorMatrixType => ([
  0.33, 0.33, 0.33, 0, 0,
  0.33, 0.33, 0.33, 0, 0,
  0.33, 0.33, 0.33, 0, 0,
  0,    0,    0,    1, 0,
]);

import { ImageSourcePropType, StyleProp, ViewStyle, ImageStyle } from 'react-native';

interface ColoredImageProps {
  color?: string;
  imageSource: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  brightness?: number;
}

const ColoredImage: React.FC<ColoredImageProps> = ({ color = '#00FF00', imageSource, style, containerStyle, brightness = 1 }) => {
  const [showDesaturated, setShowDesaturated] = useState(false);
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);

  useEffect(() => {
    const red = parseInt(color.substring(1, 3), 16) / 255;
    const green = parseInt(color.substring(3, 5), 16) / 255;
    const blue = parseInt(color.substring(5, 7), 16) / 255;
    setR(red);
    setG(green);
    setB(blue);
  }, [color]);

  const getTintMatrix = (): ColorMatrixType => {
    return(
    [
    r*brightness, 0, 0, 0, 0,
    0, g*brightness, 0, 0, 0,
    0, 0, b*brightness, 0, 0,
    0, 0, 0, 1, 0,
  ])};

  return (
    <View style={containerStyle}>
        <ColorMatrix
            matrix={concatColorMatrices(getDesaturationMatrix(), getTintMatrix())}
            style={style}
        >
          <Image
            source={imageSource}
            style={containerStyle}
          />
        </ColorMatrix>
    </View>
  );
};

export default ColoredImage;