import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Image, RefreshControl, ActivityIndicator } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import features from '../../constants/AtlanticupBuildungFeatures';
import { atlanticupGetPlaceFromId, atlanticupGetSportFromId, atlanticupGetEventsFromPlaceId } from '../../backend/atlanticupBackendFunctions';
import ScreenLoader from '../../components/ScreenLoader';
import AtlanticupEventItem from '../../components/Atlanticup/AtlanticupEventItem';
import { useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');
const ITEMS_PER_PAGE = 10;

interface SportItemProps {
    item: any;
    navigation: any;
}

interface User {
    id: string;
}

const SportItem: React.FC<SportItemProps> = ({ item, navigation }) => {
    return (
        <TouchableOpacity onPress={() => navigation.navigate('SportDetailScreen', { sport: item })}>
            <View style={styles.sportItemContainer}>
                <Image source={{ uri: item.image }} style={styles.image}/>
                <Text style={styles.text}>{item.title_short}</Text>
            </View>
        </TouchableOpacity>
    );
};

const AtlanticupMapScreen: React.FC<any> = () => {
    const mapRef = useRef<MapboxGL.MapView>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const cameraRef = useRef<MapboxGL.Camera>(null);

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
        MapboxGL.setTelemetryEnabled(false);
        if (cameraRef.current){
            cameraRef.current.setCamera({
                centerCoordinate: [-4.571357, 45.358577],
                zoomLevel: 15,
                animationDuration: 0,
                animationMode : 'none', 
            });
        }
    }, []);

    useEffect(() => {
        if (redirection && typeof redirection === 'string') {
            handleNewPlaceId(redirection);
        }
    }, [redirection]);

    const handleNewPlaceId = async (place_id: string) => {
        console.log('redirection to place_id : ', place_id);
        const feature = features.find((item) => item.properties.id === place_id);
        if (feature) {
            moveCameraToCoordinate(feature.properties.centerCoordinates[0], feature.properties.centerCoordinates[1], feature.properties.defaultZoom);
            setSelectedFeature(feature);
            setLoading(true);
            if (bottomSheetRef.current) {
                console.log('balise1');
                bottomSheetRef.current.snapToIndex(1);
                console.log('balise2');
            }
            console.log('balise3');

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

    const moveCameraToCoordinate = (longitude: number, latitude: number, zoom: number) => {
        console.log('moving to coordinates : ', longitude, latitude, zoom);
        if (cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: [longitude, latitude],
                zoomLevel: zoom,
                animationDuration: 0,
                animationMode : 'none',
            });
        }
        console.log('moved');
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
            moveCameraToCoordinate(feature.properties.centerCoordinates[0], feature.properties.centerCoordinates[1], feature.properties.defaultZoom);
            setSelectedFeature(feature);
            setLoading(true);
            if (bottomSheetRef.current) {
                bottomSheetRef.current.snapToIndex(Math.max(1, currentIndex));
                // problème avec cette fonction
            }
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
                        renderItem={({ item }) => <SportItem item={item} navigation={navigation} />}
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
                    if (bottomSheetRef.current) {
                        bottomSheetRef.current.snapToIndex(3);
                    }
                }}>
                    <Text style={{ fontWeight: '900', fontSize: 18, color: 'red', textAlign: 'center' }}>MATCH EN COURS</Text>
                    <Text style={{ fontWeight: '900', fontSize: 15, color: 'blue', textAlign: 'center' }}>voir détails</Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => {
                setCurrentIndex(2);
                if (bottomSheetRef.current) {
                    bottomSheetRef.current.snapToIndex(2);
                }
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
        ne: [-4.578357, 48.363577],
        sw: [-4.564357, 48.353577],
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <MapboxGL.MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/streets-v10" ref={mapRef}>
                <MapboxGL.Camera ref={cameraRef} maxBounds={bounds} zoomLevel={15} centerCoordinate={[-4.571357, 45.358577]} />
                {features.map((item, index) => (
                    <MapboxGL.ShapeSource key={index.toString()} id={`polygonSource-${index}`} shape={item} onPress={handlePress}>
                    <MapboxGL.FillExtrusionLayer
                        id={`extrusionLayer-${index}`}
                        style={{
                        fillExtrusionColor: ['get', 'color'],
                        fillExtrusionHeight: ['get', 'height'],
                        fillExtrusionBase: 0,
                        fillExtrusionOpacity: 0.7,
                        }}
                        minZoomLevel={0}
                        maxZoomLevel={22}
                    />
                    </MapboxGL.ShapeSource>
                ))}
                </MapboxGL.MapView>

                <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={['4%', '25%', '50%', '75%']} onChange={handleSheetChange}>
                {renderPlaceDetails()}
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    bottomSheetContent: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'grey',
    },
    bottomSheetTitleContainer: {
        height: height * 0.045,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSheetAvailibilityContainer: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        paddingBottom: 20,
    },
    bottomSheetActivitiesContainer: {
        flex: 2,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    bottomSheetBotttomContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    firstRowContainer: {
        height: height * 0.16,
        flexDirection: 'row',
    },
    secondRowContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
    },
    sportItemContainer: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        width: 80,
        height: 80,
        backgroundColor: 'lightgrey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        tintColor: 'black',
    },
    text: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    descriptionContainer: {
        flex: 2,
        height: '100%',
        justifyContent: 'center',
        marginLeft: 10,
        paddingRight: 5,
    },
});

export default AtlanticupMapScreen;
