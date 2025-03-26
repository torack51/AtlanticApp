import React from 'react';
import { View, Text, StyleSheet, Image, Pressable} from 'react-native';
interface SmallSportIconProps {
   item: { id: string }
}

const SmallSportIcon: React.FC<SmallSportIconProps> = (props) => {

    const sportIcons: Record<string, any> = {
        badminton: require("../../../assets/images/icons/sport-icons/badminton.png"),
        basketball: require("../../../assets/images/icons/sport-icons/basketball.png"),
        running: require("../../../assets/images/icons/sport-icons/running.png"),
        climbing: require("../../../assets/images/icons/sport-icons/climbing.png"),
        football: require("../../../assets/images/icons/sport-icons/football.png"),
        handball: require("../../../assets/images/icons/sport-icons/handball.png"),
        rugby: require("../../../assets/images/icons/sport-icons/rugby.png"),
        "table-tennis": require("../../../assets/images/icons/sport-icons/table-tennis.png"),
        ultimate: require("../../../assets/images/icons/sport-icons/ultimate.png"),
        volley: require("../../../assets/images/icons/sport-icons/volley.png"),        
      };

      const pathToImage = sportIcons[props.item.id.split("_")[0]] || require("../../../assets/images/icons/logo_ac.png");
      if (pathToImage == require("../../../assets/images/icons/logo_ac.png")) {
          console.log('item : ', props.item.id.split("_")[0], pathToImage);
        }

    const navigateToSport = () => {
        console.log('navigate to sport : ', props.item.id);
    }

    //console.log('path : ', pathToImage);
    return (
        <View style={styles.container}>
            <Pressable onPress={navigateToSport}>
                <Image source={pathToImage} style={styles.image} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal:5,
    },
    image:{
        width: 40,
        height: 40,
        backgroundColor:"rgb(0,17,250)",
        borderRadius:40,
        tintColor:"white",
        padding:5,
    }
});

export default SmallSportIcon;