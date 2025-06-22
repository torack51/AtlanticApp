import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image} from 'react-native';

const TEXT_COLOR = '#fff';
const BACKGROUND_COLOR = '#3498db';
const FONT_SIZE = 40; // Taille de la police pour le texte

const ANGLE_DEGREES = -30; // Angle d'inclinaison en degrés (ex: -30 degrés)
const ANGLE_RADIANS = (ANGLE_DEGREES * Math.PI) / 180; // Conversion en radians

const ANIMATION_SPEED_PX_PER_SEC = 60; // Vitesse de défilement le long de la diagonale

const TEXT = "FOOTBALL";

// --- Composant animé ---
const AnimatedAnnouncementRectangle = ({width, height}: {width: number; height: number;}) => {
  // --- Configuration de l'animation et du texte ---
  const LINE_HEIGHT_PLUS_SPACING = FONT_SIZE + 10; // Hauteur d'une ligne de texte + son espacement

  const scrollValue = useRef(new Animated.Value(0)).current; // Pour le défilement
  const rectangleWidth = width;
  const rectangleHeight = height;

  // Calcul de la "longueur" le long de l'axe de défilement diagonal
  // Si le texte est horizontal dans son propre conteneur, puis tourné,
  // alors la quantité de défilement "verticale" (avant rotation) est la hauteur du contenu.
  // Une fois tourné, cela devient une combinaison de X et Y.
  // Pour un défilement "le long de la diagonale", on peut simplement faire défiler
  // le conteneur du texte avant rotation, puis appliquer la rotation.

  useEffect(() => {

    // La distance totale à parcourir (hauteur totale du contenu dupliqué)
    const totalScrollDistance = (rectangleWidth**2 + rectangleHeight**2) ** 0.5 + 50;
    const animationDuration = (totalScrollDistance / ANIMATION_SPEED_PX_PER_SEC) * 1000;

    const startAnimation = () => {
      scrollValue.setValue(-1); // Réinitialise la valeur de défilement au début
      
      Animated.sequence([
        Animated.timing(scrollValue, {
        toValue: 0, // Défile vers le haut
        duration: animationDuration/2,
        useNativeDriver: true,
        easing: Easing.bezier(0, 0.9, 0.75, 0.9), // Courbe d'accélération
      }),
        Animated.timing(scrollValue, {
        toValue: 1, // Défile vers le bas
        duration: animationDuration/2,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 1, 0.1), // Courbe d'accélération
      }),
      ])
      .start(() => {
        startAnimation(); // Relance l'animation pour une boucle continue
      });
    };

    startAnimation();

    return () => {
      scrollValue.stopAnimation();
    };
  }, [ANIMATION_SPEED_PX_PER_SEC]);

  const offsetX = -(rectangleWidth * Math.cos(ANGLE_RADIANS));
  const offsetY = (rectangleWidth * Math.sin(ANGLE_RADIANS));

  return (
    <View style={[styles.rectangleContainer, { width: rectangleWidth, height: rectangleHeight }]}>
      <View style={{ position: 'absolute', top: 0, left: 0, width: rectangleWidth, height: rectangleHeight }}>
        <Image
          source={require('../assets/images/sports/1000-500/blurred_rugby.png')} // Assurez-vous que le chemin est correct
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          resizeMode="cover"
        />
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
            {TEXT}
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
            {TEXT}
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
            {TEXT}
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
            {TEXT}
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
});

export default AnimatedAnnouncementRectangle;