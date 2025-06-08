import React from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity, Image} from 'react-native';

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

    const [fadeInAnim] = React.useState(new Animated.Value(0));
    const [fadeOutAnim] = React.useState(new Animated.Value(0.75));
    const [currentImage, setCurrentImage] = React.useState(0); 
    const [nextImage, setNextImage] = React.useState(1);
    const selectedSchoolImage = props.selectedSchoolImage ? { uri: props.selectedSchoolImage } : images[0];

    React.useEffect(() => {
        animate();
    }, [currentImage]);

    const animate = () => {
        Animated.sequence([
            Animated.delay(500),
            Animated.parallel([
                Animated.timing(fadeInAnim, {
                    toValue: 0.75,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeOutAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]),
            Animated.delay(500), // Wait for the fade out to complete
        ]).start(() => {
            setCurrentImage((currentImage + 1) % (images.length));
            setNextImage((nextImage + 1) % (images.length));
            fadeInAnim.setValue(0);
            fadeOutAnim.setValue(0.75);
        });
    };

    if (props.selectedSchoolID && props.selectedSchoolName && props.selectedSchoolImage) {
        return(
            <View style={styles.container}>
                <View style={{height:'100%', alignItems:'center', justifyContent:'center'}}>
                    <Image source={selectedSchoolImage} 
                        style={{width: '100%', height: '100%', resizeMode: 'contain'}} />
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={{height:'100%', alignItems:'center', justifyContent:'center'}}>
                <Animated.Image
                    source={images[currentImage]}
                    style={[
                        {
                            width: '100%',
                            height: '100%',
                            resizeMode: 'contain',
                            position:'absolute',
                            opacity: fadeOutAnim,
                        }
                    ]}
                />
                <Animated.Image
                    source={images[nextImage]}
                    style={[
                        {
                            width: '100%',
                            height: '100%',
                            resizeMode: 'contain',
                            position: 'absolute',
                            opacity: fadeInAnim,
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
});

export default SchoolPicker;