import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-native-paper';
import AtlanticupMatchDetailType1 from '../components/Atlanticup/MatchDetail/AtlanticupMatchDetailType1';
import AtlanticupMatchDetailType2 from '../components/Atlanticup/MatchDetail/AtlanticupMatchDetailType2';
import AtlanticupMatchDetailType3 from '../components/Atlanticup/MatchDetail/AtlanticupMatchDetailType3';

interface Match {
    sport_id: string;
    id: string;
    place_id: string;
    status: string;
    ranking: any;
    team1_score: any;
    team2_score: any;
    teams_id: string[];
    description: string;
    teams: any;
}

interface MatchDetailScreenProps {
    route: {
        params: {
            match: Match;
        };
    };
    navigation: any;
}

interface MatchDetailScreenState {
    match: Match;
    hasAdministratorRights: boolean;
    updateModalVisible: boolean;
    location: any;
    refreshing: boolean;
    team1_score: any;
    team2_score: any;
    scores: any;
    ranking: any;
    selectedStatus: any;
    dropDownMenuVisible: boolean;
    sport: any;
}

class MatchDetailScreen extends Component<MatchDetailScreenProps, MatchDetailScreenState> {
    constructor(props: MatchDetailScreenProps) {
        super(props);
        this.state = {
            match: this.props.route.params.match,
            hasAdministratorRights: false,
            updateModalVisible: false,
            location: null,
            refreshing: false,
            team1_score: null,
            team2_score: null,
            scores: null,
            ranking: null,
            selectedStatus: null,
            dropDownMenuVisible: false,
            sport: null,
        };
    }

    render() {
        const match = this.state.match;
        const renderMatch = (match: Match) => {
            switch (match.sport_id) {
                case 'basketball_f':
                case 'basketball_m':
                case 'football_f':
                case 'football_m':
                case 'handball':
                case 'rugby_m':
                case 'ultimate':
                    return <AtlanticupMatchDetailType1 match={match} navigation={this.props.navigation} sport={this.state.sport} hasAdministratorRights={this.state.hasAdministratorRights} />;
                case 'badminton':
                case 'table_tennis':
                case 'volleyball_f':
                case 'volleyball_m':
                    return <AtlanticupMatchDetailType2 match={match} navigation={this.props.navigation} sport={this.state.sport} location={this.state.location} hasAdministratorRights={this.state.hasAdministratorRights} />;
                case 'running':
                case 'climbing_m':
                case 'climbing_f':
                    return <AtlanticupMatchDetailType3 match={match} navigation={this.props.navigation} sport={this.state.sport} location={this.state.location} hasAdministratorRights={this.state.hasAdministratorRights} />;
                default:
                    return <Text>Match not found</Text>;
            }
        };

        return (
            <Provider>
                <View style={{ flex: 1 }}>
                    {renderMatch(this.state.match)}
                </View>
            </Provider>
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
    },
});

export default MatchDetailScreen;