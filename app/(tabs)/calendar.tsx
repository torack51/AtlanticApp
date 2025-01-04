import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { atlanticupGetMoreIncomingEvents, atlanticupGetInitialIncomingEvents } from '../../backend/atlanticupBackendFunctions';
import AtlanticupEventItem from '../../components/Atlanticup/AtlanticupEventItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface State {
    loading: boolean;
    loadingMore : boolean;
    allLoaded : boolean;
    events: Event[];
    seeSchoolOnly: boolean;
    lastVisible: number;
    selectedTeam: string | null;
}

class CalendarTab extends Component<{}, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            loading: false,
            loadingMore: false,
            allLoaded: false,
            events: [],
            seeSchoolOnly: false,
            lastVisible: 0,
            selectedTeam: null,
        };
        this.seeSchoolOnlyPressed = this.seeSchoolOnlyPressed.bind(this);
    }

    seeSchoolOnlyPressed = () => {
        this.setState(prevState => ({
            seeSchoolOnly: !prevState.seeSchoolOnly
        }));
    };

    getTeamFromStorage = async () => {
        const team = await AsyncStorage.getItem("atlanticup_team");
        if (team){
            this.setState({selectedTeam:team});
        }
        else{
            this.setState({selectedTeam:null});
        }
    }

    fetchInitialEvents = async () => {
        this.setState({loading:true});
        try{
            const {items, lastVisible} = await atlanticupGetInitialIncomingEvents(ITEMS_PER_PAGE);
            this.setState({
                events: items,
                lastVisible,
                loading:false,
                allLoaded:false,
            })
            this.getTeamFromStorage();
        }
        catch(error){
            console.log(error);
            this.setState({loading:false});
        }
    };

    fetchMoreEvents = async () =>{
        if (this.state.loadingMore || this.state.allLoaded){
            return;
        }
        this.setState({loadingMore:true});
        try{
            const {items, lastVisible} = await atlanticupGetMoreIncomingEvents(this.state.lastVisible, ITEMS_PER_PAGE);
            if (items.length>0){
                this.setState({
                    events: this.state.events.concat(items),
                    lastVisible,
                    loadingMore:false,
                })
            }
            else{
                this.setState({loadingMore:false, allLoaded:true});
            }
        }
        catch(error){
            console.log(error);
            this.setState({loadingMore:false});
        }
    }

    renderItem = ({ item }: { item: Event }) => {
        // Implémentez la logique pour rendre un élément de la liste
        if (item.kind=="match"){
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }} onPress={() => {}}/>
        }
        else{
            return <AtlanticupEventItem event={item} currentUser={{ currentUser: {} as User }} onPress={() => {}}/>
        }
    };

    renderFooter = () => {
        return this.state.loadingMore ? (
            <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" />
            </View>
        ) : null;
    };

    componentDidMount(){
        this.fetchInitialEvents();
    }

    render() {
        const { loading, events, seeSchoolOnly } = this.state;
        return (
            <SafeAreaView style={styles.container}>
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
                    onPress={this.seeSchoolOnlyPressed}
                >
                    <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: seeSchoolOnly ? 'white' : 'black' }}>
                        Voir pour mon école uniquement
                    </Text>
                </TouchableOpacity>

                <View style={styles.listContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" />
                    ) : (
                        <FlatList
                            data={events}
                            renderItem={this.renderItem}
                            keyExtractor={(item) => item.id}
                            refreshControl={
                                <RefreshControl
                                    refreshing={loading}
                                    onRefresh={this.fetchInitialEvents}
                                />
                            }
                            onEndReached={this.fetchMoreEvents}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={this.renderFooter}
                        />
                    )}
                </View>
            </SafeAreaView>
        );
    }
}

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