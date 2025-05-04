import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Menu, Button, Provider } from 'react-native-paper';
import { atlanticupGetSportFromId, atlanticupGetUserFromId, atlanticupGetMatchFromId, atlanticupGetPlaceFromId, atlanticupUpdateMatchStatus, atlanticupGetTeamFromId, atlanticupGetDelegationFromId} from '../../backend/atlanticupBackendFunctions';
import UpdateScoreType1 from '@/components/UpdateScore/AtlanticupUpdateScoreType1';
import UpdateScoreType2 from '@/components/UpdateScore/AtlanticupUpdateScoreType2';
import UpdateScoreType3 from '@/components/UpdateScore/AtlanticupUpdateScoreType3';
import auth from '@react-native-firebase/auth';
import ScreenLoader from '@/components/ScreenLoader';
import { Link, useLocalSearchParams, useRouter} from 'expo-router';

const width = Dimensions.get('window').width;

interface Props {
    match: any;
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
    activity_id: string;
    category : string;
    place_id : string | null;
}

interface Team{
    delegation: any;
    description: string;
}

const MatchPage: React.FC<Props> = () => {
    const router = useRouter();

    const [state, setState] = useState<{
        match_id : any;
        match: Match | null;
        sport: any | null;
        location: any | null;
        hasAdministratorRights: boolean;
        dropDownMenuVisible: boolean;
        updateModalVisible: boolean;
        refreshing: boolean;
        team1: Team | null;
        team2: Team | null;
        team1_score: number | null;
        team2_score: number | null;
        team1_delegation: any | null;
        team2_delegation: any | null;
        selectedStatus: string | null;
    }>({
        match_id : useLocalSearchParams().id,
        match: null,
        sport: null,
        location: null,
        hasAdministratorRights: false,
        dropDownMenuVisible: false,
        updateModalVisible: false,
        refreshing: false,
        team1 : null,
        team2 : null,
        team1_score: null,
        team2_score: null,
        team1_delegation: null,
        team2_delegation: null,
        selectedStatus: null,
    });

    const checkForAdministratorRights = async () => {
        
        const currentUser = auth().currentUser;
        if (currentUser) {
            const user = await atlanticupGetUserFromId(currentUser.uid);
            if (user.is_special_event_organizer) {
                setState(prevState => ({ ...prevState, hasAdministratorRights: true }));
            }
        }
    };

    const fetchSport = async () => {
        if (state.match){
            const sport = await atlanticupGetSportFromId(state.match.sport_id);
            setState(prevState => ({ ...prevState, sport: sport }));
        }
    };

    const fetchMatch = async () => {
        const matchData = await atlanticupGetMatchFromId(state.match_id);
        const newMatch = matchData;
        setState(prevState => ({ ...prevState, match: newMatch }));
    };

    const fetchTeams = async () => {
        if (state.match){
            const team1 = await atlanticupGetTeamFromId(state.match.team1_id);
            const team2 = await atlanticupGetTeamFromId(state.match.team2_id);
            setState(prevState => ({ ...prevState, team1: team1, team2: team2}));
        }
    }

    const fetchDelegations = async () => {
        if (state.team1 != null && state.team2 != null) {
            const team1_delegation = await atlanticupGetDelegationFromId(state.team1.delegation);
            const team2_delegation = await atlanticupGetDelegationFromId(state.team2.delegation);
            setState(prevState => ({ ...prevState, team1_delegation: team1_delegation, team2_delegation: team2_delegation}));
        } else {
            console.warn('team1 or team2 is null');
        }
    }

    const fetchLocation = async () => {
        if (state.match){
            const location = (state.match.place_id ? await atlanticupGetPlaceFromId(state.match.place_id) : null);
            setState(prevState => ({ ...prevState, location: location }));
        }
    };

    const onRefresh = useCallback(() => {
        setState(prevState => ({ ...prevState, refreshing: true }));
        checkForAdministratorRights();
        fetchMatch();
        fetchLocation();
        setState(prevState => ({ ...prevState, refreshing: false }));
    }, []);

    useEffect(() => {
        console.log("state : ", state)
        checkForAdministratorRights();
        fetchMatch();
    }, []);

    useEffect(() => {
        console.log('refresh match');
        fetchTeams();
        fetchLocation();
        fetchSport();
    }, [state.match]);

    useEffect(() => {
        console.log('refresh teams');
        fetchDelegations();
    }, [state.team1, state.team2]);


    const openDropDownMenu = () => {
        setState(prevState => ({ ...prevState, dropDownMenuVisible: true }));
    };

    const closeDropDownMenu = () => {
        setState(prevState => ({ ...prevState, dropDownMenuVisible: false }));
    };

    const openModal = () => {
        setState(prevState => ({ ...prevState, updateModalVisible: true }));
    };

    const closeModal = () => {
        setState(prevState => ({ ...prevState, updateModalVisible: false }));
    };

    const updateMatchStatus = async (newStatus: string) => {
        await atlanticupUpdateMatchStatus(state.match_id, newStatus);
        fetchMatch();
    };

    const redirectToMap = () => {
        console.log('pressed : ', state.location);
        if (state.location){
            router.navigate(`/map?location=${state.location.id}`);
        }
        else{
            console.warn('Lieu introuvable');
        }
        //this.props.navigation.navigate('Carte', { redirect_to_place_id: state.match.place_id });
    };

    const redirectToSport = () => {
        if (state.sport){
            router.navigate(`/competition/sportDetail/${state.sport.id}?name=${state.sport.title}`);
        }
        else{
            console.warn('Sport introuvable');
        }
        //this.props.navigation.navigate('Sport', { sport_id: state.match.sport_id });
    }

    const renderScore = (score: number | null) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'black', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 }}>
                <Text style={{ fontSize: 24, color: 'white' }}>{score}</Text>
            </View>
        );
    };

    const matchStatus = (() => {
        if (state.match) {
            switch (state.match.status) {
                case 'played':
                    return "Terminé";
                case 'playing':
                    return "En cours";
                case 'later':
                    return "Pas encore joué";
                case 'cancelled':
                    return "Annulé";
                case 'postponed':
                    return "Reporté";
                default:
                    return "Inconnu";
            }
        } else {
            return "Inconnu";
        }
    })();

    const category = (() => {
        if (state.match){
            switch (state.match.category) {
                case 'f':
                    return "Finale";
                case '2f':
                    return "Demi-finale";
                case '3f':
                    return "Match pour la 3ème place";
                case '4f':
                    return "Quart de finale";
                case '8f':
                    return "Huitième de finale";
                case '16f':
                    return "Seizième de finale";
                case 'gs':
                    return "Phase de groupes";
                default:
                    return "Inconnu";
            }
        } else {    
            return "Inconnu";
        }
    })();

    const team1 = state.team1;
    const team2 = state.team2;
    const delegation1 = state.team1_delegation;
    const delegation2 = state.team2_delegation;

    if (team1 == null || team2 == null || delegation1 == null || delegation2 == null) {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <View style={styles.screen_loader_container}>
                    <ScreenLoader/>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ flex: 1, width: width }} scrollEnabled={false} refreshControl={<RefreshControl refreshing={state.refreshing} onRefresh={onRefresh} />}>
                <View style={styles.upper_container}>
                    <View style={{ position: 'absolute', top: -30, left: -30, opacity: 0.1, transform: [{ rotate: '-30deg' }] }}>
                        <Image source={{ uri: delegation1.image }} style={{ width: 250, height: 250 }} />
                    </View>
                    <View style={{ position: 'absolute', bottom: -30, right: -50, opacity: 0.1, transform: [{ rotate: '-30deg' }] }}>
                        <Image source={{ uri: delegation2.image }} style={{ width: 250, height: 250 }} />
                    </View>

                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: 10 }}>{category}</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>{state.match.description}</Text>
                    </View>

                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <View style={{ margin: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{delegation1.title} {delegation1.description}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                        </View>
                    </View>

                    <View style={{ margin: 5, alignItems: 'flex-start' }}>
                        {renderScore(state.match.team1_score)}
                    </View>

                    {state.hasAdministratorRights ?
                        <Menu
                            visible={state.dropDownMenuVisible}
                            onDismiss={closeDropDownMenu}
                            anchor={<Button onPress={openDropDownMenu}>{matchStatus}</Button>}
                        >
                            <Menu.Item onPress={() => { updateMatchStatus("playing"); closeDropDownMenu(); }} title="En cours" />
                            <Menu.Item onPress={() => { updateMatchStatus("played"); closeDropDownMenu(); }} title="Terminé" />
                            <Menu.Item onPress={() => { updateMatchStatus("later"); closeDropDownMenu(); }} title="Pas encore joué" />
                            <Menu.Item onPress={() => { updateMatchStatus("cancelled"); closeDropDownMenu(); }} title="Annulé" />
                            <Menu.Item onPress={() => { updateMatchStatus("postponed"); closeDropDownMenu(); }} title="Reporté" />
                        </Menu>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, borderRadius: 3 }}>
                            <Text style={{ fontSize: 12, color: 'black' }}>{matchStatus}</Text>
                        </View>
                    }

                    <View style={{ margin: 5, alignItems: 'flex-start' }}>
                        {renderScore(state.match.team2_score)}
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                        </View>

                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                            <View style={{ margin: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{delegation2.title} {delegation2.description}</Text>
                            </View>
                        </View>
                    </View>

                </View>
                <View style={styles.lower_container}>
                    {state.sport &&
                        <TouchableOpacity style={{ padding: 10, margin: 10, borderRadius: 15, backgroundColor: '#76b9f5' }} onPress={redirectToSport}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>Plus sur la section {state.sport.title}</Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3495eb', padding: 15, borderRadius: 20 }} onPress={redirectToMap}>
                        <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>{state.location == null ? "Voir sur la carte" : state.location.title} </Text>
                        <Image source={require('../../assets/images/icons/locate-outline.png')} style={{ width: 25, height: 25, tintColor: 'white' }} />
                    </TouchableOpacity>
                    {state.hasAdministratorRights ?
                        <TouchableOpacity style={{ backgroundColor: '#0269c4', margin: 10, padding: 10, borderRadius: 20 }} onPress={openModal}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>Modifier les scores</Text>
                        </TouchableOpacity>
                        : null}
                </View>
            </ScrollView>

            <Modal
                animationType="none"
                transparent={true}
                visible={state.updateModalVisible}
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modal_background}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modal_content}>
                                <UpdateScoreType1 
                                match={{ 
                                    id: state.match.id, 
                                    team1_name: delegation1.title, 
                                    team1_description: delegation1.description, 
                                    team2_name: delegation2.title, 
                                    team2_description: delegation2.description 
                                }} 
                                closeModal={closeModal} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    upper_container: {
        flex: 6,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lower_container: {
        flex: 4,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal_background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal_content: {
        height: '60%',
        width: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    screen_loader_container: {
        height:250,
        width:250,
    },
});

export default MatchPage;
