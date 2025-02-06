import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, Image, Dimensions } from 'react-native';
import { atlanticupFetchRanking, atlanticupGetAllDelegations } from '../../../backend/atlanticupBackendFunctions';
import { FlatList } from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;

interface Delegation {
    id: string;
    title: string;
    image: string;
}

interface Ranking {
    rank: string[];
}

const DelegationItem: React.FC<{ item: Delegation }> = ({ item }) => {
    return (
        <View style={styles.item_container}>
            <Text style={styles.delegation_title}>{item.title}</Text>
            <Image source={{ uri: item.image }} style={{ width: 100, height: 100 }} />
        </View>
    );
};

const GeneralRanking: React.FC = () => {
    const [rankingId, setRankingId] = useState<string[]>([]);
    const [ranking, setRanking] = useState<Delegation[]>([]);
    const [delegations, setDelegations] = useState<Delegation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchDelegations = useCallback(async () => {
        const delegations = await atlanticupGetAllDelegations();
        setDelegations(delegations);
    }, []);

    const fetchRanking = useCallback(async () => {
        const ranking = await atlanticupFetchRanking();
        setRankingId(ranking.rank);
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await fetchRanking();
        await fetchDelegations();
        setRanking(rankingId.map(id => delegations.find(delegation => delegation.id === id) as Delegation));
        setLoading(false);
    }, [fetchRanking, fetchDelegations, rankingId, delegations]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    console.log('ranking : ', ranking);
    return (
        <Text>Texte</Text>
    );
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} />}>
                <View style={styles.title_container}>
                    <Text style={styles.title}>Classement Général</Text>
                </View>
                {(loading? <Text>Loading...</Text> : 
                <FlatList
                    data={ranking}
                    renderItem={({ item }) => <DelegationItem item={item} />}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={{ flex: 1 }}
                />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    title: {
        fontSize: 20,
    },
    item_container: {
        flex: 1,
        alignItems: 'center',
        margin: 10,
        width: width * 0.8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    delegation_title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default GeneralRanking;
