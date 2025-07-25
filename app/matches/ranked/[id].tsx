import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Menu, Button, Provider } from 'react-native-paper';
import { atlanticupUpdateMatchStatus } from '@/backend/atlanticupBackendFunctions';
import { getSportFromId } from '@/backend/firestore/sportsService';
import { getUserFromUid } from '@/backend/firestore/usersService';
import { getAllDelegations } from '@/backend/firestore/schoolsService';
import { getMatchFromId } from '@/backend/firestore/matchService';
import { getTeamFromId } from '@/backend/firestore/teamService';
import { getDelegationFromId } from '@/backend/firestore/delegationService';
import { getPlaceFromId } from '@/backend/firestore/placeService';
import UpdateScoreType1 from '@/components/UpdateScore/AtlanticupUpdateScoreType1';
import auth from '@react-native-firebase/auth';
import ScreenLoader from '@/components/ScreenLoader';
import { Link, useLocalSearchParams, useRouter} from 'expo-router';

const width = Dimensions.get('window').width;

interface Props {
}

interface Match {
    id: string;
    kind: string;
    sport_id: string;
    start_time: any;
    status: string;
    teams: Array<{ id: string; delegation: { color: string; image: string; title: string }; description: string }>;
    title: string;
    description: string;
    category : string;
    place_id : string | null;
}

interface Team{
    id : string;
    category: string;
    delegation_id: string;
    description: string;
    sport: string;
}

interface Delegation {
    id: string;
    title: string;
    color: string;
    image: string;
}

const MatchPage: React.FC<Props> = () => {
    const router = useRouter();
    const match_id = useLocalSearchParams().id;
    const [match, setMatch] = useState<Match | null>(null);
    const [activeFetches, setActiveFetches] = useState(0);
    const [hasAdministratorRights, setHasAdministratorRights] = useState(false);
    const [sport, setSport] = useState<any | null>(null);
    const [teams, setTeams] = useState<Array<Team> | null>(null);
    const [delegations, setDelegations] = useState<Array<Delegation> | null>(null);
    const [location, setLocation] = useState<any | null>(null);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState<string | null>(null);

    const checkForAdministratorRights = async () => {
        const currentUser = auth().currentUser;
        if (currentUser) {
            const user = await getUserFromUid(currentUser.uid);
            if (!user.anonymous) {
                setHasAdministratorRights(true);
            }
        }
    };

    const fetchSport = async (sport_id: string | null) => {
        setActiveFetches(prev => prev + 1);
        sport_id ? await getSportFromId(sport_id).then(sport => {setSport(sport); setActiveFetches(prev => prev - 1)}) : (setSport(null), setActiveFetches(prev => prev - 1));
    };

    const fetchMatch = async (match_id : string | null) => {
        setActiveFetches(prev => prev + 1);
        match_id ? await getMatchFromId(match_id).then(newMatch => {setMatch(newMatch); setActiveFetches(prev => prev - 1)}) : (setMatch(null), setActiveFetches(prev => prev - 1));
    };

    const fetchTeams = async (team1_id : string | null, team2_id : string | null) => {
    }

    const fetchDelegations = async (delegation1_id : string, delegation2_id : string) => {
        setActiveFetches(prev => prev + 2);
    }

    const fetchLocation = async (place_id : string | null) => {
        setActiveFetches(prev => prev + 1);
        place_id ? await getPlaceFromId(place_id).then(location => {setLocation(location); setActiveFetches(prev => prev - 1)}) : (setLocation(null), setActiveFetches(prev => prev - 1));
    };

    const onRefresh = useCallback(() => {
        checkForAdministratorRights();
        fetchMatch(match_id);
    }, []);

    useEffect(() => {
        checkForAdministratorRights();
        fetchMatch(match_id);
    }, []);

    useEffect(() => {
    }, [activeFetches]);

    useEffect(() => {
        if (match){
            fetchLocation(match.place_id);
            fetchSport(match.sport_id);
        }
    }, [match]);

    useEffect(() => {
        if (sport && categoryId) {
            const category = sport.categories[categoryId];
            if (category) {
                setCategoryName(category.description);
            } else {
                setCategoryName(null);
            }
        } else {
            setCategoryName(null);
        }
    }, [categoryId, sport]);

   /*const openDropDownMenu = () => {
        setState(prevState => ({ ...prevState, dropDownMenuVisible: true }));
    };

    const closeDropDownMenu = () => {
        setState(prevState => ({ ...prevState, dropDownMenuVisible: false }));
    };*/

    /*const openModal = () => {
        setState(prevState => ({ ...prevState, updateModalVisible: true }));
    };

    const closeModal = () => {
        setState(prevState => ({ ...prevState, updateModalVisible: false }));
    };*/

    const updateMatchStatus = async (newStatus: string) => {
        await atlanticupUpdateMatchStatus(match_id, newStatus);
        fetchMatch(match_id);
    };

    const redirectToMap = () => {
        if (location){
            router.navigate(`/map?location=${location.id}`);
        }
        else{
            console.warn('Lieu introuvable');
        }
    };

    const redirectToSport = () => {
        if (sport){
            router.navigate(`/competition`);
            setTimeout(() => {
                router.navigate(`/competition/sportDetail/${sport.id}?name=${sport.title}&categoryName=${categoryName}&categoryId=${categoryId}`);
            }, 50);        }
        else{
            console.warn('Sport introuvable');
        }
        //this.props.navigation.navigate('Sport', { sport_id: state.match.sport_id });
    }

    const matchStatus = (() => {
        if (match) {
            switch (match.status) {
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
        if (match){
            switch (match.category) {
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

    if (activeFetches>0 || !match || !teams || !delegations) {
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
            <ScrollView contentContainerStyle={{ flex: 1, width: width }} scrollEnabled={false} refreshControl={<RefreshControl refreshing={activeFetches>0} onRefresh={onRefresh} />}>
                <View style={styles.upper_container}>

                    <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: 10 }}>{category}</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>{match.description}</Text>
                    </View>

                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>

                        </View>
                        <View style={{ flex: 1 }}>
                        </View>
                    </View>

                    <View style={{ margin: 5, alignItems: 'flex-start' }}>
                    </View>

                    {/*state.hasAdministratorRights ?
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
                    */}

                    <View style={{ margin: 5, alignItems: 'flex-start' }}>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                        </View>

                        <View style={{ flex: 1, alignItems: 'flex-start' }}>

                        </View>
                    </View>

                </View>
                <View style={styles.lower_container}>
                    {sport &&
                        <TouchableOpacity style={{ padding: 10, margin: 10, borderRadius: 15, backgroundColor: '#76b9f5' }} onPress={redirectToSport}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>Plus sur la section {sport.title} - {categoryName}</Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3495eb', padding: 15, borderRadius: 20 }} onPress={redirectToMap}>
                        <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>{location == null ? "Voir sur la carte" : location.title} </Text>
                        <Image source={require('../../../assets/images/icons/locate-outline.png')} style={{ width: 25, height: 25, tintColor: 'white' }} />
                    </TouchableOpacity>
                    {hasAdministratorRights ?
                        <TouchableOpacity style={{ backgroundColor: '#0269c4', margin: 10, padding: 10, borderRadius: 20 }} onPress={openModal}>
                            <Text style={{ fontWeight: 'bold', color: 'white' }}>Modifier les scores</Text>
                        </TouchableOpacity>
                        : null}
                </View>
            </ScrollView>

            {/*<Modal
                animationType="none"
                transparent={true}
                visible={updateModalVisible}
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modal_background}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modal_content}>
                                <UpdateScoreType1 
                                match={{ 
                                    id: match_id, 
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
            </Modal>*/}
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
