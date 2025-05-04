import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { atlanticupGetMoreIncomingEvents, atlanticupGetInitialIncomingEvents } from '../../backend/atlanticupBackendFunctions';
import AtlanticupEventItem from '../../components/AtlanticupEventItem';
import AtlanticupMatchItem from '@/components/AtlanticupMatchItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLoader from '@/components/ScreenLoader';

interface User {
    id: string;
}

const ITEMS_PER_PAGE = 10;

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

const CalendarTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [seeSchoolOnly, setSeeSchoolOnly] = useState(false);
    const [lastVisibleItem, setLastVisibleItem] = useState(0);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    const insets = useSafeAreaInsets();

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

    const renderItem = ({ item }: { item: Event }) => {
        if (item.kind === "match") {
            return <AtlanticupMatchItem match={item} currentUser={{ currentUser: {} as User }}/>;
        } else {
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }}/>;
        }
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
            <View style={styles.topBar}>
                <Text style={styles.topText}>Evénements futurs</Text>
            </View>
            <TouchableOpacity
                style={{
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    height: 50,
                    width: '60%',
                    borderRadius: 20,
                    backgroundColor: seeSchoolOnly ? '#1d4966' : 'rgba(0,0,0,0)'
                }}
                onPress={seeSchoolOnlyPressed}
            >
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: seeSchoolOnly ? 'white' : 'black' }}>
                    Voir pour mon école uniquement
                </Text>
            </TouchableOpacity>

            <View style={styles.listContainer}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{height:200, width:200}}>
                            <ScreenLoader/>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={displayEvents}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={fetchInitialEvents}
                            />
                        }
                        onEndReached={fetchMoreEvents}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                    />
                )}
            </View>
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
});

export default CalendarTab;
