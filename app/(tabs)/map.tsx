import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Pressable, PanResponder, Platform, Image, Touchable} from 'react-native';
import MapView, { Marker} from 'react-native-maps';
import { FlatList, GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import Carousel, {ICarouselInstance} from "react-native-reanimated-carousel"
import Animated, { useSharedValue, useAnimatedStyle, Easing, withTiming, useDerivedValue} from "react-native-reanimated";
import AnimatedMarker from '../../components/Map/AnimatedMarker';
import TextTicker from 'react-native-text-ticker';
import { atlanticupGetPlaceFromId, atlanticupGetEventsFromPlaceId, atlanticupGetAllPlaces } from '../../backend/atlanticupBackendFunctions';
import { getAllSports } from '@/backend/firestore/sportsService';
import EventCard from '@/components/Event/EventCard';
import SmallSportIcon from '@/components/Map/SmallSportIcon';
import { useLocalSearchParams } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';


const { width, height } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 500;

interface SportItemProps {
    item: any;
}

interface User {
    id: string;
}

const AtlanticupItem = ({ item }: any) => {
    return <EventCard event={item} />;
}


const AtlanticupMapScreen: React.FC<any> = () => {

    const {location : initialPlaceId} = useLocalSearchParams();
    const [targetPlace, setTargetPlace] = useState<any>(null);
    const mapRef = useRef<MapView>(null);
    const carouselRef = useRef<ICarouselInstance>(null);
    const height = useSharedValue(MIN_HEIGHT);
    const [expanded, setExpanded] = useState(false);
    const [selectedMarkerId, setSelectedMarkerId] = useState(null);
    const [places, setPlaces] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sports, setSports] = useState<any[]>([]);
    const [sportsByPlace, setSportsByPlace] = useState<any[]>([]);

    const tabBarHeight = useBottomTabBarHeight();


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
        setSelectedMarkerId(location.id);
        moveToPosition(location.position);
    };

    const snapToNext = () => {
        const currentIndex = places.findIndex((place) => place.id === selectedMarkerId);
        const nextIndex = (currentIndex + 1) % places.length;
        carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
        onSnapToItem(nextIndex);
    };

    const snapToPrevious = () => {
        const currentIndex = places.findIndex((place) => place.id === selectedMarkerId);
        const previousIndex = (currentIndex - 1) % places.length;
        carouselRef.current?.scrollTo({ index: previousIndex, animated: true });
        onSnapToItem(previousIndex);
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
            carouselRef.current?.scrollTo({index : index});
            onSnapToItem(index);
        }
    };

    const expansion = useDerivedValue(() => {
        return (height.value - MIN_HEIGHT)/(MAX_HEIGHT - MIN_HEIGHT)
    })

    const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    }));

    const animatedCardHeaderHeight = useAnimatedStyle(() => ({
        height:MIN_HEIGHT - 80*expansion.value,
    }))

    const animatedHeaderTitle = useAnimatedStyle(() => ({
        height: 60 - 30*expansion.value,
        lineHeight: 60 - 30*expansion.value,
        fontSize :35 - 15*expansion.value,
    }))

    const animatedSportsContainerHeight = useAnimatedStyle(() => ({
        height: 80 - 20*expansion.value,
    }))

    const animatedDropdownButtonHeight = useAnimatedStyle(() => ({
        height: 60 - 30*expansion.value,
    }))

    const animatedOpacity = useAnimatedStyle(() => ({
        opacity: expansion.value,
    }))

    const animatedReverseOpacity = useAnimatedStyle(() => ({
        opacity: Math.max(0, 1 - Math.pow(expansion.value, 0.05)),
    }));


    useEffect(() => {
        atlanticupGetAllPlaces().then((data) => {
            setPlaces(data);
            const firstPlace = data[0];
            setSelectedMarkerId(firstPlace.id);
            moveToPosition(firstPlace.position);
        });
        getAllSports().then((data) => {
            setSports(data);
        });
    }, []);

    useEffect(() => {
        setLoading(true);
        atlanticupGetAllPlaces().then(async (allPlaces) => {
            setPlaces(allPlaces);

            if (initialPlaceId) {
                const target = allPlaces.find(place => place.id === initialPlaceId);
                if (target) {
                    setTargetPlace(target);
                    moveToPosition(target.position);
                    setSelectedMarkerId(target.id);
                    const index = allPlaces.findIndex(place => place.id === initialPlaceId);
                    if (index !== -1) {
                        setTimeout(() => {
                            carouselRef.current?.scrollTo({ index: index, animated: true });
                        }, 500);
                    }
                } else {
                    console.warn(`Lieu avec l'ID ${initialPlaceId} non trouvé.`);
                }
            } else if (allPlaces.length > 0) {
                const firstPlace = allPlaces[0];
                setTargetPlace(firstPlace);
                moveToPosition(firstPlace.position);
                setSelectedMarkerId(firstPlace.id);
            }
            setLoading(false);
        });
        getAllSports().then((data) => {
            setSports(data);
        });
    }, [initialPlaceId]);

    useEffect(() => {
        setEvents([]);
        const place = places.find((loc) => loc.id === selectedMarkerId);
        if (place) {
            setLoading(true);
            atlanticupGetEventsFromPlaceId(10, place.id, null).then((data) => {
                setEvents(data.items);
                setLoading(false);
            });
        }
        else{
            if (selectedMarkerId !== null) {
                console.warn(`Lieu avec l'ID ${selectedMarkerId} non trouvé.`);
            }
        }
    },[selectedMarkerId])

    useEffect(() => {
        if ((places.length > 0) && (sports.length > 0)) {
            setSportsByPlace(
                places.map((place) => {
                    return {place_id : place.id, sports : sports.filter((sport) => place.sports_id_list.includes(sport.id))};
                }
            ));
        }

    },[sports])

      const initialRegion = {
        latitude : 48.358616,
        longitude : -4.571361,
        latitudeDelta : 0.006,
        longitudeDelta : 0.006,
      }

      const renderCarouselItem = ({item, index}) => {
        return (
            <Animated.View style={styles.card}>
                <Animated.View style={[styles.card_header, animatedCardHeaderHeight]}>
                    <View style={styles.card_header_top_bar}>
                        <View style={styles.title_container}>
                            <Pressable onPress={toggleCarousel}>
                                <Animated.Text style={[styles.title, animatedHeaderTitle]} numberOfLines={1} adjustsFontSizeToFit>{ item.title }</Animated.Text>
                            </Pressable>
                        </View>
                        <Animated.View style={[styles.header_middle_part, animatedSportsContainerHeight]}>
                            <View style={{ flex:1, aspectRatio:1, alignSelf:'center' }}>
                                <Pressable onPress={snapToPrevious} style={{flex:1}}>
                                    <Image source={require('../../assets/images/icons/chevrons/chevron_left.png')} style={{flex: 1,width:'50%', aspectRatio:1, tintColor:'rgba(0,0,0,0.5)'}}/>
                                </Pressable>
                            </View>
                            {
                                (sportsByPlace.length > 0) &&
                                <View style={styles.sports_container}>
                                    <FlatList
                                        data={sportsByPlace[index].sports}
                                        renderItem={({item}) => <SmallSportIcon sport={item} />}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(item) => item.id}
                                        contentContainerStyle={{ paddingHorizontal: 10}}
                                    />
                                    <LinearGradient
                                        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.leftGradient}
                                        pointerEvents="none"
                                    />
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.rightGradient}
                                        pointerEvents="none"
                                    />
                                </View>
                            }
                            <View style={{ flex:1, aspectRatio:1, alignSelf:'center' }}>
                                <Pressable onPress={snapToNext} style={{flex:1}}>
                                    <Image source={require('../../assets/images/icons/chevrons/chevron_right.png')} style={{flex: 1,width:'50%', aspectRatio:1, tintColor:'rgba(0,0,0,0.5)'}}/>
                                </Pressable>
                            </View>
                        </Animated.View>
                        <Animated.View style={[styles.dropdown_button, animatedDropdownButtonHeight]}>
                            <Pressable onPress={toggleCarousel} style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                                <Image source={require('../../assets/images/icons/chevrons/chevron_down.png')} style={{flex:1, height:'100%', aspectRatio:1, tintColor:'rgba(0,0,0,0.5)'}}/>
                            </Pressable>
                        </Animated.View>
                    </View>
                </Animated.View>
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
      <GestureHandlerRootView style={{ flex: 1,  paddingBottom: Platform.OS == "ios" ? tabBarHeight : 0 }}>
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
                  //showsPointsOfInterest={false}  //cache les Point Of Interest pour iOS
                
            >
                {places.map((loc) => (
                    <Marker 
                        key={loc.id} 
                        coordinate={{ latitude: loc.position.latitude, longitude: loc.position.longitude }} 
                        onPress={() => onMarkerPress(loc)}
                        zIndex={selectedMarkerId === loc.id ? 1 : 0}
                        anchor={{ x: 0.5, y: 0.5 }} // Centrer le marqueur
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


       {/*} <GestureDetector gesture={gesture}>*/}
            <Animated.View style={[styles.carouselContainer, animatedStyle]}>
                <Carousel
                    ref={carouselRef}
                    width={width}
                    height={width / 2}
                    data={places}
                    renderItem={renderCarouselItem}
                    onSnapToItem={onSnapToItem}
                    style={styles.carouselStyle}
                />
            </Animated.View>
        {/*</GestureDetector>*/}
      </GestureHandlerRootView>
    )
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { 
        flex: 1,
    },
    carouselContainer: {
        backgroundColor: 'white',
    },
    carouselStyle:{
        height:'100%',
    },
    card: {
        height: MAX_HEIGHT,
        width: '100%',
        alignSelf: "center",
    },
    card_header:{
        width:'100%',
        alignItems:'center',
    },
    card_header_top_bar:{
        width:'100%',
    },
    current_activity_container:{
        justifyContent:'center',
        bottom:0,
        height:25,
    },
    dropdown_button:{
        justifyContent:'center',
        alignItems:'center',
    },
    card_body:{
        flex:1,
        height:'100%',
    },
    title_container:{
        alignItems:'center',
        justifyContent:'center',
    },
    header_middle_part:{
        flexDirection:'row',
        justifyContent:'center',
    },
    sports_container:{
        width: '75%',
    },
    title: { 
        fontWeight: "bold",
    },
    leftGradient: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 10,
    },
    rightGradient: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 10,
    },
  });


export default AtlanticupMapScreen;
