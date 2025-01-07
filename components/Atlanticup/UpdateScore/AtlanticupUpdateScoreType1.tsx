import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { atlanticupGetMatchFromId, atlanticupUpdateType1MatchScore } from '../../../backend/atlanticupBackendFunctions';

//A UTILISER POUR LES SPORTS SUIVANTS : FOOTBALL, BASKETBALL, HANDBALL, RUGBY, ULTIMATE

interface Match {
    id: string;
    team1_name: string;
    team1_description: string;
    team2_name: string;
    team2_description: string;
}

interface UpdateScoreType1Props {
    match: Match;
    closeModal: () => void;
}

const UpdateScoreType1: React.FC<UpdateScoreType1Props> = ({ match, closeModal }) => {
    const [score1, setScore1] = useState<number>(0);
    const [score2, setScore2] = useState<number>(0);

    const fetchMatch = async (match_id: string) => {
        const match = await atlanticupGetMatchFromId(match_id);
        setScore1(parseInt(match.team1_score));
        setScore2(parseInt(match.team2_score));
    }

    const updateScore = async (match_id: string, score1: number, score2: number) => {
        await atlanticupUpdateType1MatchScore(match_id, score1, score2);
        Alert.alert('Score mis à jour', 'Rafraîchissez la page pour voir les changements');
        closeModal();
    }

    useEffect(() => {
        fetchMatch(match.id);
    }, [match.id]);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.score_container}>
                    <TouchableOpacity onPress={() => setScore1(score1 + 1)}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                    <Text>{score1}</Text>
                    <Text>{match.team1_name} {match.team1_description}</Text>

                    <TouchableOpacity onPress={() => { if (score1 > 0) { setScore1(score1 - 1) } }}>
                        <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text>-</Text>
                </View>
                <View style={styles.score_container}>
                    <TouchableOpacity onPress={() => setScore2(score2 + 1)}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                    <Text>{score2}</Text>
                    <Text>{match.team2_name} {match.team2_description}</Text>

                    <TouchableOpacity onPress={() => { if (score2 > 0) { setScore2(score2 - 1) } }}>
                        <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.validation_container}>
                <TouchableOpacity onPress={() => updateScore(match.id, score1, score2)} style={{ backgroundColor: '#76b9f5', padding: 15, borderRadius: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Mettre à jour</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    score_container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    validation_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'grey',
        fontSize: 50,
    }
});

export default UpdateScoreType1;