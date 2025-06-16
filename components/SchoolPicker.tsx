import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity, Image} from 'react-native';
import { Easing } from 'react-native-reanimated';


interface SchoolPickerProps {
    selectedSchoolID: string | null;
    selectedSchoolName: string | null;
    selectedSchoolImage: string | null;
    selectedSchoolColor: string | null;
}

const images = [
    require('@/assets/images/schools/logo_enib.png'),
    require('@/assets/images/schools/logo_enssat_lannion.png'),
    require('@/assets/images/schools/logo_ensta_bretagne.png'),
    require('@/assets/images/schools/logo_imt_atlantique.png'),
    require('@/assets/images/schools/logo_isen.png'),
    require('@/assets/images/schools/logo_ubo.png'),
]


const SchoolPicker: React.FC<SchoolPickerProps> = (props) => {

    const animations = new Animated.Value(0);
    const data = [ 
        require('@/assets/images/schools/logo_enib.png'),
        require('@/assets/images/schools/logo_enssat_lannion.png'),
        require('@/assets/images/schools/logo_ensta_bretagne.png'),
        require('@/assets/images/schools/logo_imt_atlantique.png'),
        require('@/assets/images/schools/logo_isen.png'),
        require('@/assets/images/schools/logo_ubo.png'),
        require('@/assets/images/schools/logo_enib.png'),
    ];
    const length = data.length;
    const duration = 1500; // Set transition duration
    const opacity = [];
    const selectedSchoolImage = props.selectedSchoolImage ? { uri: props.selectedSchoolImage } : images[0];


    // set the opacity value for every item on our data
    data.map((item, index) => {
        opacity.push(
        animations.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0, 1, 0],
        })
        );
    });

    useEffect(() => {
        const sequence = Array.from({ length: length - 1 }, (_, i) => {
        return Animated.sequence([
            Animated.timing(animations, {
            toValue: i + 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }),
            Animated.delay(1000), // Delay before the next transition
        ]);
        });

        Animated.loop(
        Animated.sequence([
            // Start with a reset to 0
            Animated.timing(animations, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
            }),
            // Then sequence through each transition
            ...sequence
        ])
        ).start();
    }, [animations, length]);


    if (props.selectedSchoolID && props.selectedSchoolName && props.selectedSchoolImage) {
        return(
            <View style={styles.container}>
                <View style={styles.item}>
                    <Image source={selectedSchoolImage} 
                        style={{flex:1, width: '100%', height: '100%', resizeMode: 'contain'}} />
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
        {data.map((item, index) => {
            // Set opacity for each item inside the render
            const getOpacity = opacity[index];
            return (
            <Animated.View
                style={[
                styles.item,
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
    );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
},
  item: {
    height: '100%',
    width: '100%',
    position: "absolute",
    resizeMode: "contain",
  },
});

export default SchoolPicker;