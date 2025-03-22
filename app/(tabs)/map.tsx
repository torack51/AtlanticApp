import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Image, RefreshControl, ActivityIndicator, Animated, TouchableOpacity} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import features from '../../constants/AtlanticupBuildungFeatures';
import { atlanticupGetPlaceFromId, atlanticupGetSportFromId, atlanticupGetEventsFromPlaceId } from '../../backend/atlanticupBackendFunctions';
import ScreenLoader from '../../components/ScreenLoader';
import AtlanticupEventItem from '../../components/Atlanticup/AtlanticupEventItem';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import Carousel from "react-native-snap-carousel";

const { width, height } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;

interface SportItemProps {
    item: any;
}

interface User {
    id: string;
}


const SportItem: React.FC<SportItemProps> = ({ item }) => {
    return (
        <TouchableOpacity onPress={() => router.navigate(`/competition/sportDetail/${item.id}?name=${item.title}`)}>
            <View style={styles.sportItemContainer}>
                <Image source={{ uri: item.image }} style={styles.image}/>
                <Text style={styles.text}>{item.title_short}</Text>
            </View>
        </TouchableOpacity>
    );
};

const AtlanticupMapScreen: React.FC<any> = () => {
    const [loading, setLoading] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [placeDetails, setPlaceDetails] = useState<any>(null);
    const [sportsList, setSportsList] = useState<any[]>([]);
    const [loadingSports, setLoadingSports] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [allLoaded, setAllLoaded] = useState(false);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const redirection = useLocalSearchParams().location;


    useEffect(() => {
        if (redirection && typeof redirection === 'string') {
            handleNewPlaceId(redirection);
        }
    }, [redirection]);

    const handleNewPlaceId = async (place_id: string) => {
        console.log('redirection to place_id : ', place_id);
        const feature = features.find((item) => item.properties.id === place_id);
        if (feature) {
            await moveCameraToCoordinate(feature.properties.centerCoordinates[0], feature.properties.centerCoordinates[1], feature.properties.defaultZoom);
            setSelectedFeature(feature);
            setLoading(true);
            /*if (bottomSheetRef.current) {
                console.log('balise1');
                //bottomSheetRef.current.snapToIndex(1);
                console.log('balise2');
            }*/

            const placeDetails = await atlanticupGetPlaceFromId(feature.properties.id);
            setPlaceDetails(placeDetails);
            setLoading(false); 

            await loadSportsList(placeDetails.sports_id_list);
            await fetchInitialEvents();
        }
    };

    const handleSheetChange = (index: number) => {
        setCurrentIndex(index);
    };

    const moveCameraToCoordinate = async (longitude: number, latitude: number, zoom: number) => {
        console.log('moving to coordinates : ', longitude, latitude, zoom);
        //console.log('yo : ', cameraRef);
        /*if (cameraRef.current) {
            console.log('hey');
            while (!mapIsReady) {
                console.log('map not ready yet');
            }
            console.log('enfin navigating');
            cameraRef.current.setCamera({
                centerCoordinate: [longitude, latitude],
                zoomLevel: zoom,
                animationDuration: 0,
                animationMode : 'none',
            });
        }
        console.log('moved');*/
    };

    const handlePress = async (event: any) => {
        setSelectedFeature(null);
        setLoading(true);
        setPlaceDetails(null);
        setSportsList([]);
        setEvents([]);
        const { features } = event;
        if (features.length > 0) {
            const feature = features[0];
            await moveCameraToCoordinate(feature.properties.centerCoordinates[0], feature.properties.centerCoordinates[1], feature.properties.defaultZoom);
            setSelectedFeature(feature);
            setLoading(true);
            /*if (bottomSheetRef.current) {
                bottomSheetRef.current.snapToIndex(Math.max(1, currentIndex));
                // problème avec cette fonction
            }*/
            const placeDetails = await atlanticupGetPlaceFromId(feature.properties.id);
            setPlaceDetails(placeDetails);
            setLoading(false);

            await loadSportsList(placeDetails.sports_id_list);
            await fetchInitialEvents();
        }
    };

    const loadSportsList = async (id_list: string[]) => {
        if (id_list[0] === "") {
            setSportsList([]);
            setLoadingSports(false);
            return [];
        }

        setSportsList([]);
        setLoadingSports(true);
        let sports: any[] = [];
        for (let i = 0; i < id_list.length; i++) {
            const data = await atlanticupGetSportFromId(id_list[i]);
            sports.push(data);
        }
        setSportsList(sports);
        setLoadingSports(false);
        return sports;
    };

    const fetchInitialEvents = async () => {
        //console.log('fetching');
        setLoading(true);
        try {
            const { items, lastVisible } = await atlanticupGetEventsFromPlaceId(ITEMS_PER_PAGE, placeDetails.id, null);
            if (items.length > 0) {
                setEvents(items);
                setLastVisible(lastVisible);
                setLoading(false);
                setAllLoaded(false);
            } else {
                setLoading(false);
                setAllLoaded(true);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const fetchMoreEvents = async () => {
        if (loadingMore || allLoaded) {
            return;
        }
        setLoadingMore(true);
        try {
            const { items, lastVisible } = await atlanticupGetEventsFromPlaceId(ITEMS_PER_PAGE, placeDetails.id, lastVisible);
            if (items.length > 0) {
                setEvents(events.concat(items));
                setLastVisible(lastVisible);
                setLoadingMore(false);
            } else {
                setLoadingMore(false);
                setAllLoaded(true);
            }
        } catch (error) {
            console.log(error);
            setLoadingMore(false);
        }
    };

    const renderFooter = () => {
        return loadingMore ? (
            <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" />
            </View>
        ) : null;
    };

    const loadEvents = async () => {
        if (placeDetails) {
            const data: any = await atlanticupGetEventsFromPlaceId(ITEMS_PER_PAGE, placeDetails.id, null);
            const events = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].start_time >= new Date().toISOString() && (data[i].end_time == null || data[i].end_time >= new Date().toISOString())) {
                    events.push(data[i]);
                }
            }
            setEvents(events);
        }
    };

    const renderSportsList = () => {
        if (sportsList) {
            if (sportsList.length > 0) {
                return (
                    <FlatList
                        data={sportsList}
                        horizontal={true}
                        renderItem={({ item }) => <SportItem item={item}/>}
                        keyExtractor={(item) => item.id}
                    />
                );
            } else {
                return <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>Aucun sport disponible</Text>;
            }
        }
        return <Text>Erreur de chargement</Text>;
    };

    const renderItem = ({ item }: { item: any }) => {
        if (item.kind === "match") {
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }}/>;
        } else {
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }}/>;
        }
    };

    const renderEventsList = () => {
        try {
            if (events.length > 0) {
                return (
                    <FlatList
                        data={events}
                        renderItem={({ item }) => renderItem({ item })}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchInitialEvents} />}
                        onEndReached={fetchMoreEvents}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                    />
                );
            } else {
                return <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>Aucun évènement actuel</Text>;
            }
        } catch (e) {
            return <Text>Erreur de chargement</Text>;
        }
    };

    const renderPlaceStatus = () => {
        console.log('events : ', events);
        if (events.find((event) => event.status === "playing")) {
            return (
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => {
                    setCurrentIndex(2);
                    /*if (bottomSheetRef.current) {
                        bottomSheetRef.current.snapToIndex(3);
                    }*/
                }}>
                    <Text style={{ fontWeight: '900', fontSize: 18, color: 'red', textAlign: 'center' }}>MATCH EN COURS</Text>
                    <Text style={{ fontWeight: '900', fontSize: 15, color: 'blue', textAlign: 'center' }}>voir détails</Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => {
                setCurrentIndex(2);
                /*if (bottomSheetRef.current) {
                    bottomSheetRef.current.snapToIndex(2);
                }*/
            }}>
                <Text style={{ fontWeight: '900', fontSize: 18, color: 'black', textAlign: 'center' }}>Rien en cours</Text>
                <Text style={{ fontWeight: '900', fontSize: 15, color: 'blue', textAlign: 'center' }}>voir détails</Text>
            </TouchableOpacity>
        );
    };

    const renderPlaceDetails = () => {
        if (loading) {
            return (
                <View style={{ height: height * 0.2, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ height: height * 0.2, width: height * 0.2 }}>
                        <ScreenLoader />
                    </View>
                </View>
            );
        }
        if (selectedFeature && placeDetails) {
            return (
                <View style={{ flex: 1, width: '100%', alignItems: 'center', flexDirection: 'column' }}>
                    <View style={styles.bottomSheetTitleContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: 25 }} numberOfLines={1} ellipsizeMode="tail">
                            {placeDetails.title}
                        </Text>
                    </View>
                    <View style={styles.bottomSheetBotttomContainer}>
                        {placeDetails.kind === "sport" ? (
                            <View style={styles.firstRowContainer}>
                                <View style={styles.bottomSheetAvailibilityContainer}>{renderPlaceStatus()}</View>
                                <View style={styles.bottomSheetActivitiesContainer}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>Sports</Text>
                                    {renderSportsList()}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.firstRowContainer}>
                                <View style={styles.bottomSheetAvailibilityContainer}>{renderPlaceStatus()}</View>
                                <View style={styles.descriptionContainer}>
                                    <Text style={{ fontSize: 14, marginTop: 5 }}>{placeDetails.description.replace(/\\n/g, "\n")}</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.secondRowContainer}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Occupations actuelles</Text>
                            {renderEventsList()}
                        </View>
                    </View>
                </View>
            );
        }
        return <Text>Erreur de chargement</Text>;
    };

    const bounds = {
        ne: { latitude: 48.363577, longitude: -4.578357 },
        sw: { latitude: 48.353577, longitude: -4.564357 },
    };

    const mapRef = useRef<MapView>(null);
    const bottomSheetRef = useRef(null);

    const onSnapToItem = (index: number) => {
        const location = locations[index];
        mapRef.current?.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      };


    useEffect(() => {
    }, []);

    const locations = [
        { id: 1, title: "Terrain de foot", latitude: 48.359396, longitude: -4.573559 },
        { id: 2, title: "Parking", latitude: 48.358243, longitude: -4.571987},
        { id: 3, title: "B01", latitude: 48.358711, longitude: -4.570921 },
      ];


      const initialRegion = {
        latitude : 48.358616,
        longitude : -4.571361,
        latitudeDelta : 0.006,
        longitudeDelta : 0.006,
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
                {locations.map((loc) => (
                    <Marker key={loc.id} coordinate={{ latitude: loc.latitude, longitude: loc.longitude }} title={loc.title} />
                ))}
            </MapView>

            {/* Zone du carousel */}

        </View>

        <View style={styles.carouselContainer}>
          <View style={styles.dragHandle} />
          <Carousel
            data={[
              { id: 1, title: "Terrain de foot", latitude: 48.359396, longitude: -4.573559 },
              { id: 2, title: "Parking", latitude: 48.358243, longitude: -4.571987 },
              { id: 3, title: "B01", latitude: 48.358711, longitude: -4.570921 },
            ]}
            renderItem={({ item }: { item: { id: number; title: string; latitude: number; longitude: number } }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
              </View>
            )}
            sliderWidth={width}
            itemWidth={width * 0.8}
            onSnapToItem={onSnapToItem}
          />
        </View>
      </GestureHandlerRootView>
    )
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    carouselContainer: {
      position: "absolute",
      width: "100%",
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 5,
      alignItems: "center",
    },
    dragHandle: {
      width: 40,
      height: 5,
      backgroundColor: "#ccc",
      borderRadius: 5,
      marginVertical: 10,
    },
    card: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
      elevation: 5,
    },
    title: { fontSize: 16, fontWeight: "bold" },
  });


export default AtlanticupMapScreen;
