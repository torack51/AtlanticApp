import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { atlanticupGetSportFromId, atlanticupGetUserFromId, atlanticupGetMatchFromId, atlanticupGetPlaceFromId, atlanticupUpdateMatchStatus, atlanticupGetTeamFromId, atlanticupGetDelegationFromId} from '../../backend/atlanticupBackendFunctions';
import Type1Match from './Type1Match';
import Type2Match from './Type2Match';
import Type3Match from './Type3Match';
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

    const fetchMatch = async () => {
        const matchData = await atlanticupGetMatchFromId(state.match_id);
        const newMatch = matchData;
        setState(prevState => ({ ...prevState, match: newMatch }));
    };

    useEffect(() => {
        console.log("state : ", state)
        checkForAdministratorRights();
        fetchMatch();
    }, []);

    const getMatchType = (match: Match): 'type1' | 'type2' | 'type3' => {
        console.log("getMatchType called with match: ", match);
        switch (match.sport_id) {
            case 'basketball_f':
            case 'basketball_m':
            case 'football_f':
            case 'football_m':
            case 'handball':
            case 'rugby_m':
            case 'ultimate':
                return 'type1';
            case 'volleyball_f':
            case 'volleyball_m':
            case 'badminton':
            case 'table_tennis':
                return 'type2';
            case 'relais':
            case 'climbing_f':
            case 'climbing_m':
                return 'type3';
            default:
                throw new Error(`Unknown match type: ${match.sport_id}`);
        }
    };

    if (state.match) {
        getMatchType(state.match);
    }

    return (
        <SafeAreaView style={{flex:1}}>
            {state.match &&
                (getMatchType(state.match) === 'type1' ? (
                    <Type1Match match={state.match}/>
                ) : getMatchType(state.match) === 'type2' ? (
                    <Type2Match match={state.match}/>
                ) : getMatchType(state.match) === 'type3' ? (
                    <Type3Match match={state.match}/>
                ) :
                    <></>
                )}
            {!state.match && <ScreenLoader />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
});

export default MatchPage;
