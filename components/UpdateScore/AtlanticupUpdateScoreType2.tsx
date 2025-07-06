import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { atlanticupUpdateType2MatchScore } from '../../backend/atlanticupBackendFunctions';
import { getMatchFromId } from '@/backend/firestore/matchService';

//A UTILISER POUR LES SPORTS SUIVANTS : BADMINTON, TENNIS DE TABlE, VOLLEYBALL

interface Match {
    id: string;
    team1_name: string;
    team1_description: string;
    team2_name: string;
    team2_description: string;
}

interface UpdateScoreType2Props {
    match: Match;
    closeModal: () => void;
}

const UpdateScoreType2: React.FC<UpdateScoreType2Props> = ({ match, closeModal }) => {
    const [score1, setScore1] = useState<number[]>([0]);
    const [score2, setScore2] = useState<number[]>([0]);

    const fetchMatch = async (match_id: string) => {
        const match = await getMatchFromId(match_id);
        setScore1(match.team1_score);
        setScore2(match.team2_score);
    };

    const updateScore = async (match_id: string, score1: number[], score2: number[]) => {
        await atlanticupUpdateType2MatchScore(match_id, score1, score2);
        Alert.alert('Score mis à jour', 'Rafraîchissez la page pour voir les changements');
        closeModal();
    };

    const addSet = () => {
        if (score1.length < 5) {
            const newScore1 = [...score1, 0];
            const newScore2 = [...score2, 0];

            setScore1(newScore1);
            setScore2(newScore2);
        } else {
            Alert.alert('Impossible d\'ajouter un set', 'Il y a déjà 5 sets, ce qui est la limite acceptable. (volley : 5, badmiton : 3, tennis de table : 5)');
        }
    };

    const removeSet = () => {
        if (score1.length > 1) {
            const newScore1 = score1.slice(0, -1);
            const newScore2 = score2.slice(0, -1);

            setScore1(newScore1);
            setScore2(newScore2);
        } else {
            Alert.alert('Impossible de retirer un set', 'Il doit y avoir au moins un set');
        }
    };

    useEffect(() => {
        fetchMatch(match.id);
    }, [match.id]);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.score_container}>
                    {score1.map((score, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => {
                                const newScore1 = [...score1];
                                newScore1[index] += 1;
                                setScore1(newScore1);
                            }}>
                                <Text style={styles.buttonText}>+  </Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>{score}</Text>
                            <TouchableOpacity onPress={() => {
                                if (score > 0) {
                                    const newScore1 = [...score1];
                                    newScore1[index] -= 1;
                                    setScore1(newScore1);
                                }
                            }}>
                                <Text style={styles.buttonText}>  -</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <Text>{match.team1_name} {match.team1_description}</Text>
                </View>
                <View>
                    <Text>-</Text>
                </View>
                <View style={styles.score_container}>
                    {score2.map((score, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => {
                                const newScore2 = [...score2];
                                newScore2[index] += 1;
                                setScore2(newScore2);
                            }}>
                                <Text style={styles.buttonText}>+  </Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 20 }}>{score}</Text>
                            <TouchableOpacity onPress={() => {
                                if (score > 0) {
                                    const newScore2 = [...score2];
                                    newScore2[index] -= 1;
                                    setScore2(newScore2);
                                }
                            }}>
                                <Text style={styles.buttonText}>  -</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <Text>{match.team2_name} {match.team2_description}</Text>
                </View>
            </View>

            <View style={styles.lower_modal_container}>
                <TouchableOpacity onPress={addSet} style={{ backgroundColor: '#76b9f5', padding: 5, borderRadius: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Ajouter un set</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={removeSet} style={{ backgroundColor: '#76b9f5', padding: 5, borderRadius: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Enlever un set</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => updateScore(match.id, score1, score2)} style={{ backgroundColor: '#76b9f5', padding: 15, borderRadius: 10 }}>
                    <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 18 }}>Mettre à jour</Text>
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
    lower_modal_container: {
        flex: 2,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    buttonText: {
        color: 'grey',
        fontSize: 35,
    }
});

export default UpdateScoreType2;