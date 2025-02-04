import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions, Easing, ImageSourcePropType } from 'react-native';

const images: ImageSourcePropType[] = [
    require('../images/emojis/mid-res/basketball.png'),
    require('../images/emojis/mid-res/soccer.png'),
    require('../images/emojis/mid-res/volleyball.png'),
    require('../images/emojis/mid-res/bike.png'),
    require('../images/emojis/mid-res/boat.png'),
    require('../images/emojis/mid-res/boxing_glove.png'), 
    require('../images/emojis/mid-res/clown_face.png'),
    require('../images/emojis/mid-res/dancer.png'),
    require('../images/emojis/mid-res/fishing_pole_and_fish.png'),
    require('../images/emojis/mid-res/handball.png'),
    require('../images/emojis/mid-res/joystick.png'),
    require('../images/emojis/mid-res/male_zombie.png'),
    require('../images/emojis/mid-res/man_dancing.png'),
    require('../images/emojis/mid-res/man_in_business_suit_levitating.png'),
    require('../images/emojis/mid-res/martial_arts_uniform.png'), 
    require('../images/emojis/mid-res/surfer.png'),
    require('../images/emojis/mid-res/swimmer.png'),
    require('../images/emojis/mid-res/tada.png'),
    require('../images/emojis/mid-res/tennis.png'),
    require('../images/emojis/mid-res/trophy.png'),
    require('../images/emojis/mid-res/weight_lifter.png'),
];

const ScreenLoader: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * images.length));
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        animate();
    }, [currentIndex]);

    const animate = () => {
        opacityAnim.setValue(0);
        scaleAnim.setValue(0);
        rotateAnim.setValue(0);

        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 2,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            let newIndex = Math.floor(Math.random() * (images.length - 1));
            while (newIndex === currentIndex) {
                newIndex = Math.floor(Math.random() * (images.length - 1));
            }
            setCurrentIndex(newIndex);
        });
    };

    const { width, height } = Dimensions.get('window');
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0deg', '360deg', '720deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.Image
                source={images[currentIndex]}
                style={[
                    styles.image,
                    {
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
                    },
                ]}
                resizeMode="cover"
            />
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        width:'100%',
        height:'100%',
    },
    image: {
        width:'100%', 
        height:'100%',
    },
});

export default ScreenLoader;