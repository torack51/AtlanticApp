import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Pressable} from 'react-native';
import MapView, { Marker} from 'react-native-maps';
import { FlatList, GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import Carousel from "react-native-snap-carousel";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, Easing, withTiming, useDerivedValue, interpolateColor} from "react-native-reanimated";
import AnimatedMarker from '@/components/Atlanticup/Map/AnimatedMarker';
import TextTicker from 'react-native-text-ticker';
import { atlanticupGetPlaceFromId, atlanticupGetSportFromId, atlanticupGetEventsFromPlaceId, atlanticupGetAllPlaces, atlanticupGetAllSports} from '../../backend/atlanticupBackendFunctions';
import AtlanticupEventItem from '@/components/Atlanticup/AtlanticupEventItem';
import AtlanticupMatchItem from '@/components/Atlanticup/AtlanticupMatchItem';
import SmallSportIcon from '@/components/Atlanticup/Map/SmallSportIcon';


const { width, height } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;
const MIN_HEIGHT = 100;
const MAX_HEIGHT = 500;

interface SportItemProps {
    item: any;
}

interface User {
    id: string;
}

const AtlanticupItem = ({ item }: any) => {
    if (item.kind === 'event') {
        return <AtlanticupEventItem event={item} currentUser={{ currentUser: { id: '1' } }} />;
    }
    if (item.kind === 'match') {
        return <AtlanticupMatchItem match={item} currentUser={{ currentUser: { id: '1' } }} />;
    }
}


const AtlanticupMapScreen: React.FC<any> = () => {

    const mapRef = useRef<MapView>(null);
    const carouselRef = useRef<Carousel<any>>(null);
    const height = useSharedValue(MIN_HEIGHT);
    const [expanded, setExpanded] = useState(false);
    const [selectedMarkerId, setSelectedMarkerId] = useState(null);
    const [places, setPlaces] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sports, setSports] = useState<any[]>([]);
    const [sportsByPlace, setSportsByPlace] = useState<any[]>([]);


    const gesture = Gesture.Pan()
    .onUpdate((event) => {
        // Mise à jour fluide en fonction du mouvement du doigt
        height.value = Math.max(
            MIN_HEIGHT, 
            Math.min(MAX_HEIGHT, height.value - event.translationY/5)
        );
    })
    .onEnd((event) => {
        // Détection du seuil dynamique en direct
        const threshold = (MAX_HEIGHT - MIN_HEIGHT) / 5;
        const shouldExpand = event.translationY < -threshold;
        
        // Mise à jour de l'état
        runOnJS(setExpanded)(shouldExpand);

        // Animation vers la position finale
        height.value = withTiming(shouldExpand ? MAX_HEIGHT : MIN_HEIGHT,{
            duration:500, 
            easing : Easing.out(Easing.quad)
        });
    });

    const moveToPosition = (position: {latitude :  number, longitude : number}) => {
        mapRef.current?.animateToRegion(
            {
                latitude: position.latitude,
                longitude: position.longitude,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
            },
            1000
        );
    };

    const onSnapToItem = (index: number) => {
        const location = places[index];
        setSelectedMarkerId(location.id); // Déclenche l'animation dans AnimatedMarker
        moveToPosition(location.position);
    };
    
    const toggleCarousel = () => {
        height.value = withTiming(expanded ? MIN_HEIGHT : MAX_HEIGHT,{
            duration:500, 
            easing : Easing.out(Easing.quad)
        });
        setExpanded(!expanded);
    }

    const onMarkerPress = (location) => {
        const index = places.findIndex((loc) => loc.id === location.id);
        if (index !== -1) {
            carouselRef.current?.snapToItem(index);
            onSnapToItem(index);  // Déplace la caméra
        }
    };

    const expansion = useDerivedValue(() => {
        return (height.value - MIN_HEIGHT)/(MAX_HEIGHT - MIN_HEIGHT)
    })

    const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    }));


    const animatedCardHeaderTopBarHeight = useAnimatedStyle(() => ({
        height:75 + 25*expansion.value,
    }))

    const animatedOpacity = useAnimatedStyle(() => ({
        opacity: expansion.value,
    }))

    const animatedReverseOpacity = useAnimatedStyle(() => ({
        opacity: Math.max(0, 1 - Math.pow(expansion.value, 0.05)),
    }));

    const animatedWhiteColor = useDerivedValue(() => {
        return interpolateColor(
            expansion.value,  // Valeur d'entrée
            [0, 1],          // Plage d'entrée (0 = MIN_HEIGHT, 1 = MAX_HEIGHT)
            ['rgba(250, 250, 250, 0.9)', 'rgba(250, 250, 250, 0.95)'] // Plage de couleurs (rouge → vert)
        );
    });

    const animatedWhiteBackground = useAnimatedStyle(() => {
    return {
        backgroundColor: animatedWhiteColor.value, // Utilisation de la couleur animée
    };
    });



    useEffect(() => {
        atlanticupGetAllPlaces().then((data) => {
            setPlaces(data);
            const firstPlace = data[0];
            setSelectedMarkerId(firstPlace.id);
            moveToPosition(firstPlace.position);
        });
        atlanticupGetAllSports().then((data) => {
            setSports(data);
        });
    }, []);

    useEffect(() => {
        setEvents([]);
        if (expanded){
            const place = places.find((loc) => loc.id === selectedMarkerId);
            if (place) {
                setLoading(true);
                atlanticupGetEventsFromPlaceId(10, place.id, null).then((data) => {
                    setEvents(data.items);
                    setLoading(false);
                });
            }
            else{
                console.error('Lieu non trouvé, ', selectedMarkerId)
            }
        }

    },[selectedMarkerId, expanded])

    useEffect(() => {
        if ((places.length > 0) && (sports.length > 0)) {
            setSportsByPlace(
                places.map((place) => {
                    return {place_id : place.id, sports : sports.filter((sport) => place.sports_id_list.includes(sport.id))};
                }
            ));
        }

    },[sports])


    const locations = [
        { id: 1, title: "Terrain de fooooooooooooooooooooooot", latitude: 48.359396, longitude: -4.573559 },
        { id: 2, title: "Parking", latitude: 48.358243, longitude: -4.571987},
        { id: 3, title: "B01", latitude: 48.358711, longitude: -4.570921 },
      ];

      const initialRegion = {
        latitude : 48.358616,
        longitude : -4.571361,
        latitudeDelta : 0.006,
        longitudeDelta : 0.006,
      }

      const renderCarouselItem = ({item, index}) => {
        return (
            <Animated.View style={[styles.card, animatedWhiteBackground]}>
                <View style={styles.card_header}>
                    <Animated.View style={[styles.card_header_top_bar, animatedCardHeaderTopBarHeight]}>
                        <Pressable onPress={toggleCarousel}>
                            <View style={styles.title_container}>
                                <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{ item.title }</Text>
                            </View>
                        </Pressable>
                        <View style={styles.sports_container}>
                            {
                                (sportsByPlace.length > 0) && 
                                <FlatList
                                data={sportsByPlace[index].sports}
                                renderItem={({item}) => <SmallSportIcon item={item} />}
                                horizontal
                                keyExtractor={(item) => item.id}
                            />
                            }
                            
                        </View>
                    </Animated.View>
                    <Animated.View style={[styles.current_activity_container,animatedReverseOpacity]}>
                        <Pressable onPress={toggleCarousel}>
                            <TextTicker
                                style={{ fontSize: 16, color: 'red', fontWeight: 'bold'}}
                                duration={300}
                                loop
                                repeatSpacer={0}
                            >   
                                - EN COURS - EN COURS - EN COURS - EN COURS - EN COURS - EN COURS - EN COURS -
                            </TextTicker>
                        </Pressable>
                    </Animated.View>
                </View>
                {item.id === selectedMarkerId && 
                <Animated.View style={[styles.card_body, animatedOpacity]}>
                    {
                        loading ? 
                            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                                <Text style={{fontSize:20, fontWeight:'bold'}}>Loading</Text>
                            </View>
                        : events.length === 0 ?
                            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                                <Text style={{fontSize:20, fontWeight:'bold'}}>Aucun évènement</Text>
                            </View>
                        :
                            <ScrollView contentContainerStyle={{ padding: 10 }}>
                                {events.map((item, index) => (<AtlanticupItem key={index} item={item} />))}
                            </ScrollView>
                    }
                </Animated.View>
            }
            </Animated.View>
        );
    }


    return(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                customMapStyle={[  //cache les Point Of Interest pour Android
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }],
                    },
                  ]}
                  showsPointsOfInterest={false}  //cache les Point Of Interest pour iOS
            >
                {places.map((loc) => (
                    <Marker 
                        key={loc.id} 
                        coordinate={{ latitude: loc.position.latitude, longitude: loc.position.longitude }} 
                        onPress={() => onMarkerPress(loc)}
                    >
                        <AnimatedMarker
                            loc={loc}
                            isFocused={loc.id === selectedMarkerId}
                        />
                    </Marker>
                ))}
            </MapView>
            {/* Zone du carousel */}

        </View>


        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.carouselContainer, animatedStyle]}>
            <Carousel
                ref={carouselRef}
                data={places}
                renderItem={renderCarouselItem}
                sliderWidth={width}
                itemWidth={width * 0.95}
                onSnapToItem={onSnapToItem}
            />
            </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    )
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    carouselContainer: {
      position: "absolute",
      bottom:100,
      alignSelf:"center",
      elevation: 5,
    },
    card: {
      borderRadius: 25,
      height:'100%',
      alignItems: "center",
    },
    card_header:{
        height:100,
        padding:5,
        width:'100%',
        alignItems:'center',
    },
    card_header_top_bar:{
    },
    current_activity_container:{
        position:'absolute',
        justifyContent:'center',
        bottom:0,
        height:25,
    },
    card_body:{
        flex:1,
        height:'100%',
    },
    title_container:{
        alignItems:'center',
        justifyContent:'center',
        height:30,
    },
    sports_container:{
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        padding:2,
    },
    title: { 
        fontSize:22, 
        fontWeight: "bold",
    },
  });


export default AtlanticupMapScreen;
