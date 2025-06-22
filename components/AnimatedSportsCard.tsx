import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image} from 'react-native';

const TEXT_COLOR = '#fff';
const FONT_SIZE = 40; // Taille de la police pour le texte

const ANGLE_DEGREES = -30; // Angle d'inclinaison en degrés (ex: -30 degrés)
const ANGLE_RADIANS = (ANGLE_DEGREES * Math.PI) / 180; // Conversion en radians

const ANIMATION_SPEED_PX_PER_SEC = 60; // Vitesse de défilement le long de la diagonale


const AnimatedAnnouncementRectangle = ({width, height}: {width: number; height: number;}) => {
  const LINE_HEIGHT_PLUS_SPACING = FONT_SIZE + 10; // Hauteur d'une ligne de texte + son espacement

  const scrollValue = useRef(new Animated.Value(0)).current; // Pour le défilement
  const rectangleWidth = width;
  const rectangleHeight = height;

  const totalScrollDistance = (rectangleWidth**2 + rectangleHeight**2) ** 0.5 + 50;
  const animationDuration = (totalScrollDistance / ANIMATION_SPEED_PX_PER_SEC) * 1000;

  const [textIndex, setTextIndex] = useState(0); // Pour suivre l'index du sport actuel
  const animations = useRef(new Animated.Value(0)).current;

  const images = [
    require('../assets/images/sports/1000-500/blurred_rugby.png'),
    require('../assets/images/sports/1000-500/blurred_basket.png'),
    require('../assets/images/sports/1000-500/blurred_handball.png'),
    require('../assets/images/sports/1000-500/blurred_ultimate.png'),
    require('../assets/images/sports/1000-500/blurred_relais.png'),
    require('../assets/images/sports/1000-500/blurred_rugby.png'),
  ];

  //const animations = new Animated.Value(0);
  

  const length = images.length;
  const opacity = [];

  // set the opacity value for every item on our data
  images.map((item, index) => {
      opacity.push(
      animations.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
      })
      );
  });

  const titles= [
    "RUGBY",
    "BASKET",
    "HANDBALL",
    "ULTIMATE",
    "RELAIS",
    "RUGBY",
  ];

  useEffect(() => {
    // Listener to update textIndex based on the 'animations' value
    const listener = animations.addListener(({ value }) => {
      // Round the value to the nearest integer to get the current step in the sequence
      // We add 0.5 and floor it to handle potential floating point inaccuracies and ensure
      // it rounds correctly for transitions (e.g., if value is 0.9, it's still considered 0)
      const currentIndex = Math.floor(value + 0.99);
      if (currentIndex !== textIndex) {
        setTextIndex(currentIndex);
      }
    });

    return () => {
      animations.removeListener(listener);
    };
  }, [animations, textIndex]); // Re-run effect if 'animations' or 'textIndex' changes

  useEffect(() => {
    const sequence = Array.from({ length: length - 1 }, (_, i) => {
      return Animated.parallel([
        Animated.sequence([
          Animated.timing(animations, {
            toValue: i + 1,
            duration: 1 * animationDuration / 20,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(19 * animationDuration / 20), // Delay before the next transition
        ]),
        Animated.sequence([
          Animated.timing(scrollValue, {
            toValue: -1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(scrollValue, {
            toValue: 0,
            duration: animationDuration / 2,
            useNativeDriver: true,
            easing: Easing.bezier(0, 0.9, 0.75, 0.9),
          }),
          Animated.timing(scrollValue, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 1, 0.1),
          }),
        ]),
      ]);
    });

    const startAnimation = () => {
      const animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(animations, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          ...sequence,
        ]),
        { resetBeforeIteration: true }
      );

      animationLoop.start();

      return () => {
        animationLoop.stop();
        // Reset textIndex when the animation stops or component unmounts
        setTextIndex(0); 
      };
    };

    // Make sure to call startAnimation
    return startAnimation();
  }, [length, animationDuration]); // Added animationDuration to dependency array


  const offsetX = -(rectangleWidth * Math.cos(ANGLE_RADIANS));
  const offsetY = (rectangleWidth * Math.sin(ANGLE_RADIANS));

  return (
    <View style={[styles.rectangleContainer, { width: rectangleWidth, height: rectangleHeight }]}>
      <View style={{ position: 'absolute', top: 0, left: 0, width: rectangleWidth, height: rectangleHeight }}>
        {images.map((item, index) => {
          // Set opacity for each item inside the render
          const getOpacity = opacity[index];
          return (
          <Animated.View
              style={[
              styles.image,
              { opacity: getOpacity},
              ]}
              key={index}
          >
              <Image
              source={item}
              style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'contain' }}
              key={index}
              />
          </Animated.View>
          );
      })}
      </View>
      
      <Animated.View
        style={[
          styles.textWrapper,
          {
            // Appliquez les transformations pour le défilement et la rotation
            transform: [
              { translateX: scrollValue.interpolate({ // Défilement horizontal
                  inputRange: [-1, 1],
                  outputRange: [-offsetX, offsetX] // Ajustez ces valeurs pour le point de départ
              })},
              { translateY: scrollValue.interpolate({ // Défilement vertical
                  inputRange: [-1, 1],
                  outputRange: [offsetY, -offsetY] // Ajustez ces valeurs pour le point de départ
              })},
              { rotateZ: `${ANGLE_DEGREES}deg` }, // Applique l'inclinaison
            ],
            // Le wrapper doit être assez grand pour que le texte ne soit pas coupé par son propre cadre
            // avant la rotation et le décalage.
          },
        ]}
      >
        <Text numberOfLines={1} style={[styles.announcementText, { lineHeight: LINE_HEIGHT_PLUS_SPACING }]}>
            {titles[textIndex % length]}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.textWrapper,
          {
            // Appliquez les transformations pour le défilement et la rotation
            transform: [
              { translateX: scrollValue.interpolate({ // Défilement horizontal
                  inputRange: [-1, 1],
                  outputRange: [offsetX, -offsetX] // Ajustez ces valeurs pour le point de départ
              })},
              { translateY: scrollValue.interpolate({ // Défilement vertical
                  inputRange: [-1, 1],
                  outputRange: [-offsetY, offsetY] // Ajustez ces valeurs pour le point de départ
              })},
              { rotateZ: `${ANGLE_DEGREES}deg` }, // Applique l'inclinaison
            ],
            // Le wrapper doit être assez grand pour que le texte ne soit pas coupé par son propre cadre
            // avant la rotation et le décalage.
          },
        ]}
      >
        <Text numberOfLines={1} style={[styles.announcementText, { lineHeight: LINE_HEIGHT_PLUS_SPACING }]}>
            {titles[textIndex % length]}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.textWrapper,
          {
            // Appliquez les transformations pour le défilement et la rotation
            transform: [
              { translateX: scrollValue.interpolate({ // Défilement horizontal
                  inputRange: [-1, 1],
                  outputRange: [-offsetX, offsetX] // Ajustez ces valeurs pour le point de départ
              })},
              { translateY: scrollValue.interpolate({ // Défilement vertical
                  inputRange: [-1, 1],
                  outputRange: [offsetY, -offsetY] // Ajustez ces valeurs pour le point de départ
              })},
              { rotateZ: `${ANGLE_DEGREES}deg` }, // Applique l'inclinaison
            ],
            // Le wrapper doit être assez grand pour que le texte ne soit pas coupé par son propre cadre
            // avant la rotation et le décalage.
          },
        ]}
      >
        <Text numberOfLines={1} style={[styles.announcementText, { lineHeight: LINE_HEIGHT_PLUS_SPACING }]}>
            {titles[textIndex % length]}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.textWrapper,
          {
            // Appliquez les transformations pour le défilement et la rotation
            transform: [
              { translateX: scrollValue.interpolate({ // Défilement horizontal
                  inputRange: [-1, 1],
                  outputRange: [offsetX, -offsetX] // Ajustez ces valeurs pour le point de départ
              })},
              { translateY: scrollValue.interpolate({ // Défilement vertical
                  inputRange: [-1, 1],
                  outputRange: [-offsetY, offsetY] // Ajustez ces valeurs pour le point de départ
              })},
              { rotateZ: `${ANGLE_DEGREES}deg` }, // Applique l'inclinaison
            ],
            // Le wrapper doit être assez grand pour que le texte ne soit pas coupé par son propre cadre
            // avant la rotation et le décalage.
          },
        ]}
      >
        <Text numberOfLines={1} style={[styles.announcementText, { lineHeight: LINE_HEIGHT_PLUS_SPACING }]}>
            {titles[textIndex % length]}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  rectangleContainer: {
    overflow: 'hidden', // IMPORTANT: pour cacher le texte qui dépasse
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center', // Peut-être pas nécessaire avec le positionnement absolu et les transforms
    alignItems: 'center',    // Idem
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  textWrapper: {
    // Les offsets initiaux (top, left) seront gérés par translateX/Y de l'animation
    // Centrage ou point de référence du wrapper. Mettez le au centre de la zone de défilement
    // pour que les interpolations soient plus prévisibles.
    alignItems: 'center', // Centre les lignes de texte horizontalement dans le wrapper
    justifyContent: 'center', // Centre les lignes de texte verticalement dans le wrapper
  },
  announcementText: {
    fontSize: FONT_SIZE,
    color: TEXT_COLOR,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 0,
    lineHeight: 100,
    opacity: 0.5,
  },
  image: {
    height: '100%',
    width: '100%',
    position: "absolute",
    resizeMode: "contain",
  },
});

export default AnimatedAnnouncementRectangle;