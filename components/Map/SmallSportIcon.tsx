import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';

interface Sport {
    id : string;
    image : string;
    title : string;
}

interface SmallSportIconProps {
   sport : Sport;
}

const SmallSportIcon: React.FC<SmallSportIconProps> = ({sport}) => {

    const navigateToSport = () => {
        console.log('navigate to sport : ', sport.id);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={navigateToSport} style={styles.card}>
                <Image source={{uri : sport.image}} style={styles.image} />
                <Text style={{color: 'white', fontSize: 20, fontWeight:'bold'}}>{sport.title}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        paddingVertical:5,
    },
    card:{
        flexDirection: 'row',
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingLeft:10,
        paddingRight:10,
    },
    image: {
        aspectRatio: 1,
        height:'80%',
        tintColor: "white",
    }
});

export default SmallSportIcon;