import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface AnimatedMarkerProps {
    loc: {
        id: number;
        latitude: number;
        longitude: number;
        title: string;
    };
    isFocused: boolean;
}

const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({ loc, isFocused }) => {
    const scale = useSharedValue(isFocused ? 1.5 : 1); // Départ avec 1 si pas sélectionné

    useEffect(() => {
        scale.value = withTiming(isFocused ? 1.5 : 1, { duration: 300 });
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {isFocused ? 
                <View style={styles.textContainer}>
                    <Text style={styles.text}>{loc.title}</Text> 
                </View>
                : 
                null
            }
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={require('../../assets/images/logo-atlanticup-no-background.png')} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        padding: 5,
    },
    textContainer:{
        backgroundColor:'white',
        borderRadius:10,
        padding:5,
        margin:5,
    },
    text: {
        color: 'black',
        fontWeight: 'bold',
    },
    imageContainer:{
        backgroundColor:'rgba(255,255,255,0.5)',
        borderRadius:25,
        padding:3,
    },
    image:{
        height:40,
        width:40,
    }
});

export default AnimatedMarker;
