import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { atlanticupGetMatchFromId, atlanticupUpdateType3MatchScore } from '../../backend/atlanticupBackendFunctions';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

//A UTILISER POUR LES SPORTS SUIVANTS : FOOTBALL, BASKETBALL, VOLLEY, HANDBALL, RUGBY, ULTIMATE

interface Match {
    id: string;
}

interface Team {
    id: string;
    delegation: {
        image: string;
        title: string;
    };
    description: string;
}

interface RankingItem {
    ranking: Team[]|null;
}

interface Props {
    match: Match;
    ranking: RankingItem[];
    closeModal: () => void;
}

interface DraggableItem {
    key: number;
    label: string;
    id: string;
}

const UpdateScoreType3: React.FC<Props> = ({ match, ranking, closeModal }) => {
    const updateScore = async (match_id: string, ranking: DraggableItem[]) => {
        const data = ranking.map((item) => item.id);
        await atlanticupUpdateType3MatchScore(match_id, data);
        Alert.alert('Classement mis à jour', 'Rafraîchissez la page pour voir les changements');
        closeModal();
    };

    useEffect(() => {}, []);

    const turnToExploitableData = (ranking: RankingItem[]): DraggableItem[] => {
        return ranking.map((item, index) => ({
            key: index + 1,
            label: `${item.delegation.title}\n${item.description}`,
            id: item.id,
        }));
    };

    const [newRanking, setNewRanking] = useState<DraggableItem[]>(turnToExploitableData(ranking));

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.score_container}>
                <Text>Premier</Text>
                <DraggableFlatList
                    data={newRanking}
                    containerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                    renderItem={({ item, drag, isActive }: RenderItemParams<DraggableItem>) => (
                        <TouchableOpacity
                            style={{
                                padding: 5,
                                marginVertical: 5,
                                backgroundColor: isActive ? 'blue' : 'grey',
                            }}
                            onLongPress={drag}
                            delayLongPress={50}
                        >
                            <Text style={{ color: 'white', fontSize: 15 }}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.key.toString()}
                    scrollEnabled={false}
                    onDragEnd={({ data }) => setNewRanking(data)}
                />
                <Text>Dernier</Text>
            </View>

            <View style={styles.lower_modal_container}>
                <TouchableOpacity
                    onPress={() => updateScore(match.id, newRanking)}
                    style={{ backgroundColor: '#76b9f5', padding: 15, borderRadius: 10 }}
                >
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
        flex: 5,
        margin: 20,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lower_modal_container: {
        flex: 1.5,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    buttonText: {
        color: 'grey',
        fontSize: 35,
    },
});

export default UpdateScoreType3;