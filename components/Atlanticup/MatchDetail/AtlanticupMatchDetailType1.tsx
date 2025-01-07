import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Menu, Button, Provider } from 'react-native-paper';
import { atlanticupGetSportFromId, atlanticupGetUserFromId, atlanticupGetMatchFromId, atlanticupGetPlaceFromId, atlanticupUpdateMatchStatus } from '../../../backend/atlanticupBackendFunctions';
import UpdateScoreType1 from '../UpdateScore/AtlanticupUpdateScoreType1';
import auth from '@react-native-firebase/auth';

const width = Dimensions.get('window').width;

interface Props {
    match: any;
    sport: any;
    hasAdministratorRights: boolean;
    navigation: any;
}

interface State {
    match: any;
    sport: any;
    location: any;
    hasAdministratorRights: boolean;
    dropDownMenuVisible: boolean;
    updateModalVisible: boolean;
    refreshing: boolean;
    team1_score: number | null;
    team2_score: number | null;
    selectedStatus: string | null;
}

class AtlanticupMatchDetailType1 extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            match: this.props.match,
            sport: this.props.sport,
            location: null,
            hasAdministratorRights: this.props.hasAdministratorRights,
            dropDownMenuVisible: false,
            updateModalVisible: false,
            refreshing: false,
            team1_score: null,
            team2_score: null,
            selectedStatus: null,
        };
        this.onRefresh = this.onRefresh.bind(this);
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
    };

    componentDidMount() {
        this.checkForAdministratorRights();
        this.fetchMatch();
        this.fetchLocation();
        this.fetchSport();
    }

    fetchMatch() {
        atlanticupGetMatchFromId(this.state.match.id).then((match) => {
            const newMatch = { ...this.state.match };
            newMatch.team1_score = match.team1_score;
            newMatch.team2_score = match.team2_score;
            newMatch.status = match.status;
            newMatch.description = match.description;
            this.setState({ match: newMatch });
        });
    }

    fetchLocation = async () => {
        const location = await atlanticupGetPlaceFromId(this.state.match.place_id);
        this.setState({ location: location });
    };

    onRefresh() {
        this.setState({ refreshing: true });
        this.checkForAdministratorRights();
        this.fetchMatch();
        this.fetchLocation();
        this.setState({ refreshing: false });
    }

    openDropDownMenu = () => {
        this.setState({ dropDownMenuVisible: true });
    };

    closeDropDownMenu = () => {
        this.setState({ dropDownMenuVisible: false });
    };

    openModal = () => {
        this.setState({ updateModalVisible: true });
    };

    closeModal = () => {
        this.setState({ updateModalVisible: false });
    };

    updateMatchStatus = async (newStatus: string) => {
        atlanticupUpdateMatchStatus(this.state.match.id, newStatus).then(() => {
            this.fetchMatch();
        });
    };

    redirectToMap = () => {
        this.props.navigation.navigate('Carte', { redirect_to_place_id: this.state.match.place_id });
    };

    render() {
        const match = this.state.match;

        let matchStatus;
        let category;
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

        switch (match.category) {
            case 'f':
                category = "Finale";
                break;
            case '2f':
                category = "Demi-finale";
                break;
            case '3f':
                category = "Match pour la 3ème place";
                break;
            case '4f':
                category = "Quart de finale";
                break;
            case '8f':
                category = "Huitième de finale";
                break;
            case '16f':
                category = "Seizième de finale";
                break;
            case 'gs':
                category = "Phase de groupes";
                break;
            default:
                category = "Inconnu";
        }

        const renderScore = (score: number | null) => {
            return (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'black', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 5 }}>
                    <Text style={{ fontSize: 24, color: 'white' }}>{score}</Text>
                </View>
            );
        };

        const team1 = this.state.match.teams.find((team: any) => team.id == this.state.match.team1_id);
        const team2 = this.state.match.teams.find((team: any) => team.id == this.state.match.team2_id);
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={{ flex: 1, width: width }} scrollEnabled={false} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}>
                    <View style={styles.upper_container}>
                        <View style={{ position: 'absolute', top: -30, left: -30, opacity: 0.1, transform: [{ rotate: '-30deg' }] }}>
                            <Image source={{ uri: team1.delegation.image }} style={{ width: 250, height: 250 }} />
                        </View>
                        <View style={{ position: 'absolute', bottom: -30, right: -50, opacity: 0.1, transform: [{ rotate: '-30deg' }] }}>
                            <Image source={{ uri: team2.delegation.image }} style={{ width: 250, height: 250 }} />
                        </View>

                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: 10 }}>{category}</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>{this.state.match.description}</Text>
                        </View>

                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <View style={{ margin: 5 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{team1.delegation.title} {team1.description}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                            </View>
                        </View>

                        <View style={{ margin: 5, alignItems: 'flex-start' }}>
                            {renderScore(this.state.match.team1_score)}
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

                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, borderRadius: 3 }}>
                                <Text style={{ fontSize: 12, color: 'black' }}>{matchStatus}</Text>
                            </View>
                        }

                        <View style={{ margin: 5, alignItems: 'flex-start' }}>
                            {renderScore(this.state.match.team2_score)}
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                            </View>

                            <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                <View style={{ margin: 5 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{team2.delegation.title} {team2.description}</Text>
                                </View>
                            </View>
                        </View>

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

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.updateModalVisible}
                    onRequestClose={this.closeModal}
                >
                    <TouchableWithoutFeedback onPress={this.closeModal}>
                        <View style={styles.modal_background}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modal_content}>
                                    <UpdateScoreType1 
                                    match={{ 
                                        id: this.state.match.id, 
                                        team1_name: team1.delegation.title, 
                                        team1_description: team1.description, 
                                        team2_name: team2.delegation.title, 
                                        team2_description: team2.description 
                                    }} 
                                    closeModal={this.closeModal} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </SafeAreaView>
        );
    }
}

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