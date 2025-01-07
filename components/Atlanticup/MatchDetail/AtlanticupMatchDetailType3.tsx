import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, TouchableWithoutFeedback, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Menu, Button, Provider, Modal, Portal } from 'react-native-paper';
import { atlanticupGetSportFromId, atlanticupGetUserFromId, atlanticupGetMatchFromId, atlanticupGetPlaceFromId, atlanticupUpdateMatchStatus } from '../../../backend/atlanticupBackendFunctions';
import UpdateScoreType3 from '../UpdateScore/AtlanticupUpdateScoreType3';
import auth from '@react-native-firebase/auth';
import { FlatList } from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;

interface Team {
    id: string;
    delegation: {
        image: string;
        title: string;
    };
    description: string;
}

interface Match {
    id: string;
    sport_id: string;
    place_id: string;
    status: string;
    ranking: string[];
    teams_id: string[];
    description: string;
    teams: Team[];
}

interface Sport {
    title: string;
}

interface Location {
    title: string;
}

interface Props {
    match: Match;
    sport: Sport;
    location: Location;
    hasAdministratorRights: boolean;
    navigation: any;
}

interface State {
    match: Match;
    sport: Sport;
    location: Location;
    hasAdministratorRights: boolean;
    dropDownMenuVisible: boolean;
    updateModalVisible: boolean;
    refreshing: boolean;
    teams: Team[] | null;
    ranking: Team[] | null;
    selectedStatus: string | null;
}

const TeamItem: React.FC<{ team: Team }> = ({ team }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: team.delegation.image }} style={{ width: 60, height: 60 }} />
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}> {team.delegation.title} | {team.description}</Text>
        </View>
    );
}

class AtlanticupMatchDetailType3 extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            match: this.props.match,
            sport: this.props.sport,
            location: this.props.location,
            hasAdministratorRights: this.props.hasAdministratorRights,
            dropDownMenuVisible: false,
            updateModalVisible: false,
            refreshing: false,
            teams: null,
            ranking: null,
            selectedStatus: null,
        }
        this.onRefresh = this.onRefresh.bind(this)
    }

    checkForAdministratorRights = async () => {
        const currentUser = auth().currentUser;
        if (currentUser) {
            const user = await atlanticupGetUserFromId(currentUser.uid);
            if (user.is_special_event_organizer) {
                this.setState({ hasAdministratorRights: true });
            }
        }
    };

    fetchSport = async () => {
        const sport = await atlanticupGetSportFromId(this.state.match.sport_id);
        this.setState({ sport: sport });
        this.props.navigation.setOptions({ title: sport.title });
    }

    componentDidMount() {
        this.checkForAdministratorRights();
        this.fetchMatch();
        this.fetchLocation();
        this.fetchSport();
    }

    fetchMatch() {
        atlanticupGetMatchFromId(this.state.match.id).then((match) => {
            const newMatch = { ...this.state.match };
            newMatch.ranking = match.ranking;
            newMatch.teams_id = match.teams_id;
            newMatch.status = match.status;
            newMatch.description = match.description;
            this.setState({ match: newMatch });
        })
    }

    fetchLocation = async () => {
        const location = await atlanticupGetPlaceFromId(this.state.match.place_id);
        this.setState({ location: location });
    }

    onRefresh() {
        this.setState({ refreshing: true });
        this.checkForAdministratorRights();
        this.fetchMatch();
        this.fetchLocation();
        this.setState({ refreshing: false });
    }

    openDropDownMenu = () => {
        this.setState({ dropDownMenuVisible: true })
    }

    closeDropDownMenu = () => {
        this.setState({ dropDownMenuVisible: false });
    }

    openModal = () => {
        this.setState({ updateModalVisible: true });
    }

    closeModal = () => {
        this.setState({ updateModalVisible: false });
    }

    updateMatchStatus = async (newStatus: string) => {
        atlanticupUpdateMatchStatus(this.state.match.id, newStatus).then(() => {
            this.fetchMatch();
        });
    }

    redirectToMap = () => {
        this.props.navigation.navigate('Carte', { redirect_to_place_id: this.state.match.place_id });
    }

    render() {
        const match = this.state.match;

        let matchStatus;
        switch (this.state.match.status) {
            case 'played':
                matchStatus = "Terminé";
                break;
            case 'playing':
                matchStatus = "En cours";
                break;
            case 'later':
                matchStatus = "Pas encore joué";
                break;
            case 'cancelled':
                matchStatus = "Annulé";
                break;
            case 'postponed':
                matchStatus = "Reporté";
                break;
            default:
                matchStatus = "Inconnu";
        }

        const findTeam = (team_id: string) => {
            for (let i = 0; i < match.teams.length; i++) {
                if (match.teams[i].id === team_id) {
                    return match.teams[i];
                }
            }
        }

        const ranking = match.ranking.map((team_id) => findTeam(team_id));
        return (
            <Provider>
                <SafeAreaView style={styles.container}>
                    <ScrollView contentContainerStyle={{ flex: 1, width: width }} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}>
                        <View style={styles.upper_container}>
                            <View style={{ flex: 1 }}>
                                {this.state.match.status === 'played' ?
                                    <View style={{ justifyContent: 'center' }}>
                                        <View>
                                            <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Classement</Text>
                                            <FlatList
                                                data={ranking}
                                                renderItem={({ item }) => item ? <TeamItem team={item} /> : null}
                                                keyExtractor={(item) => item?.id ?? ''}
                                                scrollEnabled={false}
                                            />
                                        </View>
                                    </View>
                                    :
                                    <View style={{ justifyContent: 'center' }}>
                                        <View>
                                            <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Équipes</Text>
                                            <FlatList
                                                data={match.teams}
                                                renderItem={({ item }) => <TeamItem team={item} />}
                                                keyExtractor={(item) => item.id}
                                                scrollEnabled={false}
                                            />
                                        </View>
                                    </View>
                                }
                            </View>

                            {this.state.hasAdministratorRights ?
                                <Menu
                                    visible={this.state.dropDownMenuVisible}
                                    onDismiss={this.closeDropDownMenu}
                                    anchor={<Button onPress={this.openDropDownMenu}>{matchStatus}</Button>}
                                >
                                    <Menu.Item onPress={() => { this.updateMatchStatus("playing"); this.closeDropDownMenu(); }} title="En cours" />
                                    <Menu.Item onPress={() => { this.updateMatchStatus("played"); this.closeDropDownMenu(); }} title="Terminé" />
                                    <Menu.Item onPress={() => { this.updateMatchStatus("later"); this.closeDropDownMenu(); }} title="Pas encore joué" />
                                    <Menu.Item onPress={() => { this.updateMatchStatus("cancelled"); this.closeDropDownMenu(); }} title="Annulé" />
                                    <Menu.Item onPress={() => { this.updateMatchStatus("postponed"); this.closeDropDownMenu(); }} title="Reporté" />
                                </Menu>
                                :
                                <Text>{matchStatus}</Text>
                            }
                        </View>
                        <View style={styles.lower_container}>
                            {this.state.sport &&
                                <TouchableOpacity onPress={() => this.props.navigation.replace("SportDetailScreen", { sport: this.state.sport })} style={{ padding: 10, margin: 10, borderRadius: 15, backgroundColor: '#76b9f5' }}>
                                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Plus sur la section {this.state.sport.title}</Text>
                                </TouchableOpacity>}
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3495eb', padding: 15, borderRadius: 20 }} onPress={this.redirectToMap}>
                                <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>{this.state.location == null ? "Voir sur la carte" : this.state.location.title} </Text>
                                <Image source={require('../../../assets/images/icons/locate-outline.png')} style={{ width: 25, height: 25, tintColor: 'white' }} />
                            </TouchableOpacity>
                            {this.state.hasAdministratorRights ?
                                <TouchableOpacity style={{ backgroundColor: '#0269c4', margin: 10, padding: 10, borderRadius: 20 }} onPress={this.openModal}>
                                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Modifier les scores</Text>
                                </TouchableOpacity>
                                : null}
                        </View>
                    </ScrollView>

                    <Portal>
                        <Modal
                            visible={this.state.updateModalVisible}
                            onDismiss={this.closeModal}
                            contentContainerStyle={styles.modal_container}
                        >
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <UpdateScoreType3 
                                match={{ 
                                    id: this.state.match.id 
                                }} 
                                ranking={ranking} 
                                closeModal={this.closeModal} />
                            </View>
                        </Modal>
                    </Portal>
                </SafeAreaView>
            </Provider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
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
    modal_container: {
        height: '90%',
        width: '80%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    modal_content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AtlanticupMatchDetailType3;