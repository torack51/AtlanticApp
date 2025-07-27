import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, RefreshControl, Image, ScrollView } from 'react-native';
import { getRankingBySportIdAndCategory } from '@/backend/firestore/rankingService';

const width = Dimensions.get('window').width;

interface ResultsTabProps {
    sport_id: any;
    category_id: any;
}

const ResultsTab: React.FC<ResultsTabProps> = ({sport_id, category_id}) => {
    const [sport, setSport] = useState<any>({});
    const [rankings, setRankings] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [delegations, setDelegations] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const ranking = await getRankingBySportIdAndCategory(sport_id, category_id);
            setRankings(ranking);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching ranking:", error);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    const renderFinalRanking = (ranking: any[]) => {
        const t = ranking.map((team, index) => (
            teams.find(t => t.id === team)
        ));

        const finalTeams = t.map(team => ({
            ...team,
            ...delegations.find(d => d.id === team?.delegation),
        }));

        if (!loading) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10, padding: 20 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Classement final</Text>
                    {finalTeams.map((team, index) => (
                        <View style={{ flexDirection: 'row', margin: 10, width: width * 0.85, justifyContent: 'space-between', alignItems: 'center' }} key={index}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{index + 1}   {team?.title} {team?.description}</Text>
                            <Image source={{ uri: team?.image }} style={{ width: 80, height: 80 }} />
                        </View>
                    ))}
                </View>
            );
        } else {
            return <></>;
        }
    };

    return (
        <View style={styles.main_container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={loading}/>}
            >
                {/*renderRanking(groups, sport_id)*/}
                { rankings.map((ranking, index) => (
                    <View key={index} style={styles.item}>  
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{ranking.title}</Text>
                        
                    </View>
                ))}
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>{sport.ranking_description}</Text>
                </View>
                {sport.ranking ? renderFinalRanking(sport.ranking) :
                    <View style={{ alignItems: 'center', height: 80, justifyContent: 'center', padding: 15 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Pas de classement définitif pour l'instant</Text>
                    </View>
                }
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
    },
    item: {
        height: 40,
        width: '100%',
        borderColor: '#888',
        borderWidth: 1,
        justifyContent: 'center',
        padding: 10,
    },
    header: {
        height: 30,
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontWeight: 'bold',
    },
});

export default ResultsTab;
