import React from 'react';
import { View, StyleSheet, Text, SafeAreaView, Dimensions, Image, RefreshControl, ActivityIndicator } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import features from '../../constants/AtlanticupBuildungFeatures';
import { atlanticupGetPlaceFromId, atlanticupGetSportFromId, atlanticupGetEventsFromPlaceId } from '../../backend/atlanticupBackendFunctions';
import ScreenLoader from '../../components/ScreenLoader';
import AtlanticupEventItem from '../../components/Atlanticup/AtlanticupEventItem';

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

interface AtlanticupMapScreenState {
    loading: boolean;
    selectedFeature: any;
    currentIndex: number;
    placeDetails: any;
    sportsList: any[];
    loadingSports: boolean;
    events: any[];
    allLoaded: boolean;
    lastVisible: any;
    loadingMore?: boolean;
}

class AtlanticupMapScreen extends React.Component<any, AtlanticupMapScreenState> {
    mapRef: React.RefObject<MapboxGL.MapView>;
    bottomSheetRef: React.RefObject<BottomSheet>;
    cameraRef: React.RefObject<MapboxGL.Camera>;

    constructor(props: any) {
        super(props);
        this.mapRef = React.createRef();
        this.bottomSheetRef = React.createRef();
        this.cameraRef = React.createRef();
        this.state = {
            loading: false,
            selectedFeature: null,
            currentIndex: -1,
            placeDetails: null,
            sportsList: [],
            loadingSports: false,
            events: [],
            allLoaded: false,
            lastVisible: null,
        };
    }

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
    }

    handleNewPlaceId = async (place_id: string) => {
        const feature = features.find((item) => item.properties.id === place_id);

        if (feature) {
            this.props.navigation.setParams({ redirect_to_place_id: null });
            this.moveCameraToCoordinate(feature.properties.centerCoordinates[0], feature.properties.centerCoordinates[1], feature.properties.defaultZoom);
            this.setState({ selectedFeature: feature, loading: true });
            if (this.bottomSheetRef.current) {
                this.bottomSheetRef.current.snapToIndex(1);
            }

            const placeDetails = await atlanticupGetPlaceFromId(feature.properties.id);
            this.setState({ placeDetails, loading: false });

            await this.loadSportsList(this.state.placeDetails.sports_id_list);
            await this.fetchInitialEvents();
        }
    };

    componentDidUpdate(prevProps: any) {
        //console.log('state : ',this.state);
        /*const { route } = this.props;
        if (route.params && (!prevProps.route.params || route.params.redirect_to_place_id !== prevProps.route.params.redirect_to_place_id)) {
            const { redirect_to_place_id } = route.params;
            this.handleNewPlaceId(redirect_to_place_id);
        }*/
    }

    handleSheetChange = (index: number) => {
        this.setState({ currentIndex: index });
    };

    moveCameraToCoordinate = (longitude: number, latitude: number, zoom: number) => {
        if (this.cameraRef.current) {
            this.cameraRef.current.setCamera({
                centerCoordinate: [longitude, latitude],
                zoomLevel: zoom,
                animationDuration: 500,
            });
        }
    };

    handlePress = async (event: any) => {
        this.setState({ selectedFeature: null, loading: true, placeDetails: null, sportsList: [], events: [] });
        const { features } = event;
        if (features.length > 0) {
            const feature = features[0];
            this.moveCameraToCoordinate(feature.properties.centerCoordinates[0], feature.properties.centerCoordinates[1], feature.properties.defaultZoom);
            this.setState({ selectedFeature: feature, loading: true });
            if (this.bottomSheetRef.current) {
                //this.bottomSheetRef.current.snapToIndex(Math.max(1, this.state.currentIndex));
                //problème avec cette fonction
            }
            const placeDetails = await atlanticupGetPlaceFromId(feature.properties.id);
            this.setState({ placeDetails : placeDetails, loading: false });
                
            await this.loadSportsList(placeDetails.sports_id_list);
            await this.fetchInitialEvents();
        }
    };

    loadSportsList = async (id_list: string[]) => {
        if (id_list[0] === "") {
            this.setState({ sportsList: [], loadingSports: false });
            return [];
        }

        this.setState({ sportsList: [], loadingSports: true });
        let sports: any[] = [];
        for (let i = 0; i < id_list.length; i++) {
            const data = await atlanticupGetSportFromId(id_list[i]);
            sports.push(data);
        }
        this.setState({ sportsList: sports, loadingSports: false });
        return sports;
    };

    fetchInitialEvents = async () => {
        console.log('fetching');
        this.setState({ loading: true });
        try {
            const { items, lastVisible } = await atlanticupGetEventsFromPlaceId(ITEMS_PER_PAGE, this.state.placeDetails.id, null);
            if (items.length > 0) {
                this.setState({
                    events: items,
                    lastVisible,
                    loading: false,
                    allLoaded: false,
                });
            } else {
                this.setState({ loading: false, allLoaded: true });
            }
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }
    };

    fetchMoreEvents = async () => {
        if (this.state.loadingMore || this.state.allLoaded) {
            return;
        }
        this.setState({ loadingMore: true });
        try {
            const { items, lastVisible } = await atlanticupGetEventsFromPlaceId(ITEMS_PER_PAGE, this.state.placeDetails.id, this.state.lastVisible);
            if (items.length > 0) {
                this.setState({
                    events: this.state.events.concat(items),
                    lastVisible,
                    loadingMore: false,
                });
            } else {
                this.setState({ loadingMore: false, allLoaded: true });
            }
        } catch (error) {
            console.log(error);
            this.setState({ loadingMore: false });
        }
    };

    renderFooter = () => {
        return this.state.loadingMore ? (
            <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" />
            </View>
        ) : null;
    };

    loadEvents = async () => {
        if (this.state.placeDetails) {
            const data:any = await atlanticupGetEventsFromPlaceId(ITEMS_PER_PAGE, this.state.placeDetails.id, null);
            const events = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].start_time >= new Date().toISOString() && (data[i].end_time == null || data[i].end_time >= new Date().toISOString())) {
                    events.push(data[i]);
                }
            }
            this.setState({ events });
        }
    };

    renderSportsList = () => {
        if (this.state.sportsList) {
            if (this.state.sportsList.length > 0) {
                return (
                    <FlatList
                        data={this.state.sportsList}
                        horizontal={true}
                        renderItem={({ item }) => <SportItem item={item} navigation={this.props.navigation} />}
                        keyExtractor={(item) => item.id}
                    />
                );
            } else {
                return <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>Aucun sport disponible</Text>;
            }
        }
        return <Text>Erreur de chargement</Text>;
    };

    renderItem = ({ item }: { item: any }) => {
        if (item.kind === "match") {
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }} onPress={() => this.props.navigation.navigate("MatchDetailScreen", { match: item })} />;
        } else {
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }} onPress={() => this.props.navigation.navigate("AtlanticupEventDetail", { event: item })} />;
        }
    };

    renderEventsList() {
        try {
            if (this.state.events.length > 0) {
                return (
                    <FlatList
                        data={this.state.events}
                        renderItem={({ item }) => this.renderItem({ item })}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.fetchInitialEvents} />}
                        onEndReached={this.fetchMoreEvents}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={this.renderFooter}
                    />
                );
            } else {
                return <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>Aucun évènement actuel</Text>;
            }
        } catch (e) {
            return <Text>Erreur de chargement</Text>;
        }
    }

    renderPlaceStatus() {
        console.log('events : ', this.state.events);
        if (this.state.events.find((event) => event.status === "playing")) {
            return (
                <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => {
                    this.setState({ currentIndex: 2 });
                    if (this.bottomSheetRef.current) {
                        this.bottomSheetRef.current.snapToIndex(3);
                    }
                }}>
                    <Text style={{ fontWeight: '900', fontSize: 18, color: 'red', textAlign: 'center' }}>MATCH EN COURS</Text>
                    <Text style={{ fontWeight: '900', fontSize: 15, color: 'blue', textAlign: 'center' }}>voir détails</Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => {
                this.setState({ currentIndex: 2 });
                if (this.bottomSheetRef.current) {
                    this.bottomSheetRef.current.snapToIndex(2);
                }
            }}>
                <Text style={{ fontWeight: '900', fontSize: 18, color: 'black', textAlign: 'center' }}>Rien en cours</Text>
                <Text style={{ fontWeight: '900', fontSize: 15, color: 'blue', textAlign: 'center' }}>voir détails</Text>
            </TouchableOpacity>
        );
    }

    renderPlaceDetails() {
        if (this.state.loading) {
            return (
                <View style={{ height: height * 0.2, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ height: height * 0.2, width: height * 0.2 }}>
                        <ScreenLoader />
                    </View>
                </View>
            );
        }
        if (this.state.selectedFeature && this.state.placeDetails) {
            return (
                <View style={{ flex: 1, width: '100%', alignItems: 'center', flexDirection: 'column' }}>
                    <View style={styles.bottomSheetTitleContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: 25 }} numberOfLines={1} ellipsizeMode="tail">
                            {this.state.placeDetails.title}
                        </Text>
                    </View>
                    <View style={styles.bottomSheetBotttomContainer}>
                        {this.state.placeDetails.kind === "sport" ? (
                            <View style={styles.firstRowContainer}>
                                <View style={styles.bottomSheetAvailibilityContainer}>{this.renderPlaceStatus()}</View>
                                <View style={styles.bottomSheetActivitiesContainer}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>Sports</Text>
                                    {this.renderSportsList()}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.firstRowContainer}>
                                <View style={styles.bottomSheetAvailibilityContainer}>{this.renderPlaceStatus()}</View>
                                <View style={styles.descriptionContainer}>
                                    <Text style={{ fontSize: 14, marginTop: 5 }}>{this.state.placeDetails.description.replace(/\\n/g, "\n")}</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.secondRowContainer}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Occupations actuelles</Text>
                            {this.renderEventsList()}
                        </View>
                    </View>
                </View>
            );
        }
        return <Text>Erreur de chargement</Text>;
    }

    render() {
        const bounds = {
            ne: [-4.578357, 48.363577],
            sw: [-4.564357, 48.353577],
        };

        return (
            <SafeAreaView style={{ flex: 1 }}>
                <GestureHandlerRootView style={styles.container}>
                    <MapboxGL.MapView style={styles.map} styleURL="mapbox://styles/mapbox/streets-v10" ref={this.mapRef}>
                        <MapboxGL.Camera ref={this.cameraRef} maxBounds={bounds} zoomLevel={15} centerCoordinate={[-4.571357, 45.358577]} pitch={45} />
                        {features.map((item, index) => (
                            <MapboxGL.ShapeSource key={index.toString()} id={`polygonSource-${index}`} shape={item} onPress={this.handlePress}>
                                <MapboxGL.FillExtrusionLayer
                                    id={`extrusionLayer-${index}`}d
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

                    <BottomSheet ref={this.bottomSheetRef} index={-1} snapPoints={['4%', '25%', '50%', '75%']} onChange={this.handleSheetChange}>
                        {this.renderPlaceDetails()}
                    </BottomSheet>
                </GestureHandlerRootView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
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
