import React, { Component } from 'react';
import { View, Text, StyleSheet, RefreshControl, Animated, FlatList, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { atlanticupGetInitialIncomingEvents , atlanticupGetMoreIncomingEvents, atlanticupGetTeamFromId} from '../../backend/atlanticupBackendFunctions';
import AtlanticupEventItem from '../../components/Atlanticup/AtlanticupEventItem';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEMS_PER_PAGE = 10;

class CalendarScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events:[],
            loading:false,
            seeSchoolOnly:false,
            selectedTeam:null,
            loadingMore:false,
            allLoaded:false,
        };
        this.seeSchoolOnlyPressed = this.seeSchoolOnlyPressed.bind(this);
    }

    componentDidMount(){
        this.fetchInitialEvents();
    }

    getTeamFromStorage = async () => {
        const team = await AsyncStorage.getItem("atlanticup_team");
        if (team){
            this.setState({selectedTeam:team});
        }
        else{
            this.setState({selectedTeam:null});
        }
    }

    fetchInitialEvents = async () =>{
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
    }

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

    renderFooter = () => {
        return this.state.loadingMore ? (
            <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" />
            </View>
        ) : null;
    };

    renderItem=({item})=>{
        if (item.kind=="match"){
            return <AtlanticupEventItem event={item} onPress={() => this.props.navigation.navigate("MatchDetailScreen", {match : item})}/>
        }
        else{
            return <AtlanticupEventItem event={item} onPress={() => this.props.navigation.navigate("AtlanticupEventDetail", {event : item})}/>
        }
    }

    seeSchoolOnlyPressed = async () => {
        await this.getTeamFromStorage();
        if (!this.state.selectedTeam){
            if (!this.state.seeSchoolOnly){
                alert("Vous devez d'abord sélectionner une équipe dans la section 'Mon Profil' pour activer cette fonctionnalité");
                return;
            }
        }
        this.setState({seeSchoolOnly : !this.state.seeSchoolOnly});
    }

    render() {
        const loading = this.state.loading
        const seeSchoolOnly = this.state.seeSchoolOnly
        var events = this.state.events
        const headerHeight = 60;

        if (seeSchoolOnly){
            events = events.filter(event => event.kind=="event" || event.teams.map((team) => team.delegation.id).includes(this.state.selectedTeam));
        }

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.topBar}>
                    <Text style={styles.topText}>Evénements futurs</Text>
                </View>
                <TouchableOpacity style={{alignItems:'center', alignSelf:'center',justifyContent:'center', height:50, width:'60%', borderRadius:20, backgroundColor: seeSchoolOnly ? '#1d4966' : 'rgba(0,0,0,0)'}} onPress={this.seeSchoolOnlyPressed}>
                    <Text style={{textAlign:'center',fontSize:14, fontWeight:'bold', color:seeSchoolOnly ? 'white'  : 'black'}}>Voir pour mon école uniquement</Text>
                </TouchableOpacity>

                <View style={styles.listContainer}>
                    {
                        loading ? <ActivityIndicator size="large"/> 
                        : 
                        <FlatList
                            data={events}
                            renderItem={({item}) => this.renderItem({item})}
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
                    }
                </View>
            </SafeAreaView>
        );
    }
}

const styles=StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar:{
        alignSelf: 'center',
        marginTop:20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topText:{
        fontSize: 30,
        fontWeight:'bold',
    },
    listContainer:{
        alignItems:'center', 
        flex:1,
    },
});

export default CalendarScreen;