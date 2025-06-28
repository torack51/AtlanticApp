import React from 'react';
import { Platform } from 'react-native';
import IosAnimatedMarker from './IosAnimatedMarker';
import AndroidAnimatedMarker from './AndroidAnimatedMarker';

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
    return (
        <>
            {Platform.OS === 'ios' ?
                <IosAnimatedMarker loc={loc} isFocused={isFocused}/>
                :
                <AndroidAnimatedMarker loc={loc} isFocused={isFocused} />
            }
        </>
    );
};

export default AnimatedMarker;
