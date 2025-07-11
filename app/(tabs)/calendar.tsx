import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, Animated, Dimensions, Image} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { atlanticupGetMoreIncomingEvents, atlanticupGetInitialIncomingEvents } from '../../backend/atlanticupBackendFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLoader from '@/components/ScreenLoader';
import AnimatedBackground from '@/components/Calendar/AnimatedBackground';
import EventCard from '@/components/Event/EventCard';

interface User {
    id: string;
}

const ITEMS_PER_PAGE = 10;

const { height: screenHeight, width : screenWidth} = Dimensions.get('window');

interface Event {
    id: string;
    sport_id: string;
    start_time: string;
    status: string;
    kind: string;
    teams: { id: string; delegation: { color: string; image: string; title: string; }; description: string; }[];
    team1_id: string;
    team2_id: string;
    title: string;
    location: string;
    description: string;
    activity_id: string;
}

interface Match {
    id: string;
    kind: string;
    sport_id: string;
    start_time: any;
    status: string;
    teams: Array<{ id: string; delegation: { color: string; image: string; title: string }; description: string }>;
    team1_id: string;
    team2_id: string;
    team1_score : any;
    team2_score : any;
    title: string;
    description: string;
    category : string;
    place_id : string | null;
}

const CalendarTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [seeSchoolOnly, setSeeSchoolOnly] = useState(false);
    const [lastVisibleItem, setLastVisibleItem] = useState(0);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    const insets = useSafeAreaInsets();

    const scrollY = useRef(new Animated.Value(0)).current;
    const listHeight = scrollY.interpolate({
        inputRange: [0, screenHeight * 0.3],
        outputRange: [screenHeight * 0.5, screenHeight * 0.8],
        extrapolate: 'clamp',
    });

    const headerHeight = scrollY.interpolate({
        inputRange: [0, screenHeight * 0.3],
        outputRange: [screenHeight * 0.5 - insets.top, screenHeight * 0.2 - insets.top],
        extrapolate: 'clamp',
    });

    const listMargin = scrollY.interpolate({
        inputRange: [0, screenHeight * 0.3],
        outputRange: [screenWidth * 0.08, 0],
        extrapolate: 'clamp',
    });

    const getTeamFromStorage = async () => {
        const team = await AsyncStorage.getItem("atlanticup_team");
        setSelectedTeam(team);
        return team;
    };

    const seeSchoolOnlyPressed = async () => {
        await getTeamFromStorage().then((team) => {
            if (!team) {
                if (!seeSchoolOnly) {
                    Alert.alert(
                        "Sélectionnez une école à soutenir.",
                        "",
                        [
                            { text: "Annuler", onPress: () => {} },
                            { text: "OK", onPress: () => {router.navigate('/other')} }
                        ]
                    );
                    return;
                }
            }
            setSeeSchoolOnly(!seeSchoolOnly);
        });
    };

    const fetchInitialEvents = async () => {
        setLoading(true);
        try {
            const { items, lastVisible } = await atlanticupGetInitialIncomingEvents(ITEMS_PER_PAGE);
            setEvents(items);
            setLastVisibleItem(lastVisible);
            setAllLoaded(false);
            getTeamFromStorage();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreEvents = async () => {
        if (loadingMore || allLoaded) {
            return;
        }
        setLoadingMore(true);
        try {
            const { items, lastVisible } = await atlanticupGetMoreIncomingEvents(lastVisibleItem, ITEMS_PER_PAGE);
            if (items.length > 0) {
                setEvents(prevEvents => [...prevEvents, ...items]);
                setLastVisibleItem(lastVisible);
            } else {
                setAllLoaded(true);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingMore(false);
        }
    };

    const renderItem = ({ item }: { item: Event | Match }) => {
        return <EventCard event={item} />;
    };

    const renderFooter = () => {
        return loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center'}}>
                <View style={{height:100, width:100}}>
                    <ScreenLoader/>
                </View>
            </View>
        ) : null;
    };

    useEffect(() => {
        fetchInitialEvents();
    }, []);

    const displayEvents = seeSchoolOnly ? (events.filter(event => event.kind=="event" || event.teams.map((team) => team.delegation.id).includes(selectedTeam))) : events;

    return (
        <SafeAreaView style={[styles.container,{paddingBottom: insets.bottom}]}>
            <View style={[styles.background,{paddingTop: insets.top}]}>
                <Animated.View 
                    style={[{ height: headerHeight, width: screenWidth}]}>
                        {/*<AnimatedBackground
                            mainLogoSource={mainLogo}
                            iconSource={mainLogo}
                            numberOfIcons={15}
                            numberOfRows={5}
                        />*/}
                        <Image 
                            source={require('../../assets/images/logo-atlanticup-no-background.png')}
                            style={styles.headerImage}
                        />
                </Animated.View>
            </View>

            <Animated.View style={[styles.eventListContainer, { height: listHeight, marginHorizontal: listMargin}]}>
                <FlatList
                    data={displayEvents}
                    scrollEnabled={!loading}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                        <View>
                            <TouchableOpacity
                                onPress={seeSchoolOnlyPressed}
                                style={styles.topBar}
                            >
                                <Animated.View style={{
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    height: 50,
                                    borderRadius: 20,
                                    paddingHorizontal:20,
                                    backgroundColor: scrollY.interpolate({
                                        inputRange: [0, screenHeight * 0.3],
                                        outputRange: ['white', '#1d4966'],
                                        extrapolate: 'clamp',
                                    }),
                                }}>
                                    <Animated.Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                        color: scrollY.interpolate({
                                            inputRange: [0, screenHeight * 0.3],
                                            outputRange: ['#1d4966', 'white'],
                                            extrapolate: 'clamp',
                                        }),
                                        fontSize: scrollY.interpolate({
                                            inputRange: [0, screenHeight * 0.3],
                                            outputRange: [18, 12],
                                            extrapolate: 'clamp',
                                        }),
                                    }}>
                                        {
                                            seeSchoolOnly ? "Retirer le filtre" : "Filtrer mon école"
                                        }
                                    </Animated.Text>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    }
                    stickyHeaderIndices={[0]}
                    contentContainerStyle={styles.eventListContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={
                        Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: false } // Important pour interpoler la hauteur
                        )
                    }
                    scrollEventThrottle={16}
                    ListEmptyComponent={() => (
                        <View style={{ height:300, width:'100%', alignItems:'center', justifyContent:'center'}}>
                            <View style={{height:200, width:200}}>
                                <ScreenLoader/>
                            </View>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchInitialEvents}
                            tintColor="#1d4966"
                        />
                    }
                />
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        alignSelf: 'center',
        marginTop: 20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    listContainer: {
        alignItems: 'center',
        flex: 1,
    },
    eventListContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    eventListContent: {
        padding: 10,
        paddingBottom: screenHeight * 0.6, // Pour permettre de scroller jusqu'en bas confortablement,
    },
    headerImage: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain',
    },
    background:{
        flex:1,
        position:'absolute',
    }
});

export default CalendarTab;
