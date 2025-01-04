import React from 'react';
import { Animated, StyleSheet, View, Image, Dimensions, Easing } from 'react-native';

const images = [
    require('../assets/images/emojis/basketball.png'),
    require('../assets/images/emojis/soccer.png'),
    require('../assets/images/emojis/volleyball.png'),
    require('../assets/images/emojis/bike.png'),
    require('../assets/images/emojis/boat.png'),
    require('../assets/images/emojis/boxing_glove.png'), 
    require('../assets/images/emojis/clown_face.png'),
    require('../assets/images/emojis/dancer.png'),
    require('../assets/images/emojis/fishing_pole_and_fish.png'),
    require('../assets/images/emojis/handball.png'),
    require('../assets/images/emojis/joystick.png'),
    require('../assets/images/emojis/male_zombie.png'),
    require('../assets/images/emojis/man_dancing.png'),
    require('../assets/images/emojis/man_in_business_suit_levitating.png'),
    require('../assets/images/emojis/martial_arts_uniform.png'), 
    require('../assets/images/emojis/surfer.png'),
    require('../assets/images/emojis/swimmer.png'),
    require('../assets/images/emojis/tada.png'),
    require('../assets/images/emojis/tennis.png'),
    require('../assets/images/emojis/trophy.png'),
    require('../assets/images/emojis/weight_lifter.png'),
];

interface ScreenLoaderState {
    currentIndex: number;
}

class ScreenLoader extends React.Component<{}, ScreenLoaderState> {
    opacityAnim: Animated.Value;
    scaleAnim: Animated.Value;
    rotateAnim: Animated.Value;

    constructor(props: {}) {
        super(props);
        this.state = {
            currentIndex: Math.floor(Math.random() * (images.length - 1)),
        };
        this.opacityAnim = new Animated.Value(0);
        this.scaleAnim = new Animated.Value(0);
        this.rotateAnim = new Animated.Value(0);
    }

    componentDidMount() {
        this.animate();
    }

    componentDidUpdate(prevProps: {}, prevState: ScreenLoaderState) {
        if (prevState.currentIndex !== this.state.currentIndex) {
            this.animate();
        }
    }

    animate() {
        this.opacityAnim.setValue(0);
        this.scaleAnim.setValue(0);
        this.rotateAnim.setValue(0);

        Animated.sequence([
            Animated.parallel([
                Animated.timing(this.opacityAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(this.scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(this.rotateAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(this.opacityAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(this.scaleAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(this.rotateAnim, {
                    toValue: 2,
                    duration: 800,
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            let newIndex = Math.floor(Math.random() * (images.length - 1));
            while (newIndex === this.state.currentIndex) {
                newIndex = Math.floor(Math.random() * (images.length - 1));
            }
            this.setState({
                currentIndex: newIndex,
            });
        });
    }

    render() {
        const { width, height } = Dimensions.get('window');
        const rotateInterpolate = this.rotateAnim.interpolate({
            inputRange: [0, 1, 2],
            outputRange: ['0deg', '360deg', '720deg'],
        });

        return (
            <View style={styles.container}>
                <Animated.Image
                    source={images[this.state.currentIndex]}
                    style={[
                        styles.image,
                        {
                            opacity: this.opacityAnim,
                            transform: [{ scale: this.scaleAnim }, { rotate: rotateInterpolate }],
                        },
                    ]}
                    resizeMode="cover"
                />
            </View>
        );
    }
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default ScreenLoader;