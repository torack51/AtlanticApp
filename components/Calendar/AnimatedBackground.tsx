import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Image, Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Props {
  mainLogoSource: any;
  iconSource: any; // La source des petits logos qui défilent
  numberOfIcons: number; // Le nombre d'icônes par file
  numberOfRows: number; // Le nombre de files de logos
}

const AnimatedBackground: React.FC<Props> = ({ mainLogoSource, iconSource, numberOfIcons = 10, numberOfRows = 3 }) => {
  const animations = useRef<Animated.Value[]>([]);
  const rows = useRef<Animated.Value[]>([]);
  const animationSpeeds = useRef<number[]>([]);
  const rowOffsetsY = useRef<number[]>([]);

  useEffect(() => {
    // Initialisation des animations et des positions de départ
    for (let i = 0; i < numberOfRows; i++) {
      animations.current[i] = new Animated.Value(i % 2 === 0 ? -screenWidth : 0); // Départ à gauche pour les paires, à droite pour les impaires
      rows.current[i] = new Animated.Value((screenHeight * 0.3) + (i * (screenHeight * 0.7) / (numberOfRows + 1))); // Espacement vertical sous le logo principal
      animationSpeeds.current[i] = 5 + Math.random() * 10; // Vitesse aléatoire
      rowOffsetsY.current[i] = Math.random() * 50 - 25; // Léger offset vertical aléatoire
    }

    // Lancement des animations en boucle
    const createAnimationLoop = (index: number) => {
      Animated.loop(
        Animated.timing(animations.current[index], {
          toValue: index % 2 === 0 ? screenWidth : -screenWidth,
          duration: animationSpeeds.current[index] * 1000, // Durée basée sur la vitesse
          useNativeDriver: true,
        })
      ).start();
    };

    for (let i = 0; i < numberOfRows; i++) {
      createAnimationLoop(i);
    }
  }, [numberOfIcons, numberOfRows, screenHeight, screenWidth]);

  

  const renderIconRow = (rowIndex: number) => {
    const icons = [];
    for (let i = 0; i < numberOfIcons; i++) {
      icons.push(
        <Animated.Image
          key={`${rowIndex}-${i}`}
          source={iconSource}
          style={[
            styles.icon,
            {
              transform: [
                { translateX: animations.current[rowIndex] },
                { translateY: ((rows.current)[rowIndex]).interpolate({
                  inputRange: [(screenHeight * 0.3), (screenHeight * 0.3) + (screenHeight * 0.7)],
                  outputRange: [rowOffsetsY.current[rowIndex], rowOffsetsY.current[rowIndex]],
                  extrapolate: 'clamp',
                }) },
              ],
            },
          ]}
        />
      );
    }
    return (
      <View key={`row-${rowIndex}`} style={styles.iconRow}>
        {icons}
      </View>
    );
  };

  return (
    <View style={styles.backgroundContainer}>
      <Image source={mainLogoSource} style={styles.mainLogo} resizeMode="contain" />
      {Array.from({ length: numberOfRows }).map((_, index) => renderIconRow(index))}
    </View>
  );
};

const styles = StyleSheet.create({
    backgroundContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0', // Couleur de fond générale
    },
    mainLogo: {
      width: screenWidth * 0.4,
      height: screenWidth * 0.4,
      zIndex: 1, // Pour être au-dessus des icônes
    },
    iconRow: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around', // Distribue les icônes horizontalement
      alignItems: 'center',
    },
    icon: {
      width: 30,
      height: 30,
      marginHorizontal: 15,
    },
  });


export default AnimatedBackground;