import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Menu, Button, Provider } from 'react-native-paper';
import { atlanticupGetSportFromId, atlanticupGetUserFromId, atlanticupGetMatchFromId, atlanticupGetPlaceFromId, atlanticupUpdateMatchStatus, atlanticupGetTeamFromId, atlanticupGetDelegationFromId} from '../../../backend/atlanticupBackendFunctions';
import UpdateScoreType1 from '../UpdateScore/AtlanticupUpdateScoreType1';
import auth from '@react-native-firebase/auth';
import ScreenLoader from '@/components/ScreenLoader';
import { Link } from 'expo-router';

const width = Dimensions.get('window').width;

interface Props {
    match: any;
}

interface Team{
    delegation: any;
    description: string;
}

const AtlanticupMatchDetailType1: React.FC<Props> = ({ match }) => {
    const [state, setState] = useState<{
        match: any;
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
        match: match,
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
        const sport = await atlanticupGetSportFromId(state.match.sport_id);
        setState(prevState => ({ ...prevState, sport: sport }));
    };

    const fetchMatch = async () => {
        const matchData = await atlanticupGetMatchFromId(state.match.id);
        const newMatch = { ...state.match };
        newMatch.team1_score = matchData.team1_score;
        newMatch.team2_score = matchData.team2_score;
        newMatch.status = matchData.status;
        newMatch.description = matchData.description;
        setState(prevState => ({ ...prevState, match: newMatch }));
    };

    const fetchTeams = async () => {
        const team1 = await atlanticupGetTeamFromId(state.match.team1_id);
        const team2 = await atlanticupGetTeamFromId(state.match.team2_id);
        setState(prevState => ({ ...prevState, team1: team1, team2: team2}));
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
        const location = await atlanticupGetPlaceFromId(state.match.place_id);
        setState(prevState => ({ ...prevState, location: location }));
    };

    const onRefresh = useCallback(() => {
        setState(prevState => ({ ...prevState, refreshing: true }));
        checkForAdministratorRights();
        fetchMatch();
        fetchLocation();
        setState(prevState => ({ ...prevState, refreshing: false }));
    }, []);

    useEffect(() => {
        checkForAdministratorRights();
        fetchMatch();
    }, []);

    useEffect(() => {
        fetchTeams();
        fetchLocation();
        fetchSport();
    }, [state.match]);

    useEffect(() => {
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
        await atlanticupUpdateMatchStatus(state.match.id, newStatus);
        fetchMatch();
    };

    const redirectToMap = () => {
        console.log('pressed');
        //this.props.navigation.navigate('Carte', { redirect_to_place_id: state.match.place_id });
    };

    const renderScore = (score: number | null) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'black', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 }}>
                <Text style={{ fontSize: 24, color: 'white' }}>{score}</Text>
            </View>
        );
    };

    const matchStatus = (() => {
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
    })();

    const category = (() => {
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
    })();

    const team1 = state.team1;
    const team2 = state.team2;
    const delegation1 = state.team1_delegation;
    const delegation2 = state.team2_delegation;

    if (team1 == null || team2 == null || delegation1 == null || delegation2 == null) {
        return (
            <SafeAreaView style={styles.container}>
                <ScreenLoader/>
            </SafeAreaView>
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
                        
                            <View style={{ padding: 10, margin: 10, borderRadius: 15, backgroundColor: '#76b9f5' }}>
                                <Text style={{ fontWeight: 'bold', color: 'white' }}>Plus sur la section {state.sport.title}</Text>
                            </View>
                        
                    }
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3495eb', padding: 15, borderRadius: 20 }} onPress={redirectToMap}>
                        <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>{state.location == null ? "Voir sur la carte" : state.location.title} </Text>
                        <Image source={require('../../../assets/images/icons/locate-outline.png')} style={{ width: 25, height: 25, tintColor: 'white' }} />
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
    }
});

export default AtlanticupMatchDetailType1;
