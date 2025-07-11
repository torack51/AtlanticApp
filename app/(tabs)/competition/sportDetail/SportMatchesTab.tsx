import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { atlanticupGetMatchesFromSportId } from '../../../../backend/atlanticupBackendFunctions';
import EventCard from '@/components/Event/EventCard';

interface SportMatchesTabProps {
    sport_id: any;
}

const SportMatchesTab: React.FC<SportMatchesTabProps> = ({sport_id}) => {
    const [matches, setMatches] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMatches(sport_id);
    }, []);

    const fetchMatches = async (sport_id: string) => {
        setRefreshing(true);
        const matches = await atlanticupGetMatchesFromSportId(sport_id);
        setMatches(matches);
        setRefreshing(false);
    };

    const turnIntoSectionList = (matches: any[]) => {
        let sectionList: { title: string; data: any[] }[] = [];
        let sections: { [key: string]: any[] } = {};

        matches.forEach((match) => {
            const category = match.category;

            if (!sections[category]) {
                sections[category] = [];
            }

            sections[category].push(match);
        });

        Object.keys(sections).forEach((category) => {
            sectionList.push({
                title: category,
                data: sections[category]
            });
        });

        return sectionList;
    };

    const sectionListData = turnIntoSectionList(matches);

    return (
        <View style={styles.container}>
            <SectionList
                onRefresh={() => fetchMatches(sport_id)}
                refreshing={refreshing}
                style={{ width: '100%', padding: 10}}
                sections={sectionListData}

                renderItem={({ item }) => (
                    <EventCard event={item} />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={{ margin: 10 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                            {title === 'gs' ? 'Phase de groupes' :
                                title === 'f' ? 'Finale' :
                                    title === '2f' ? 'Demi-finale' :
                                        title === '3f' ? 'Match pour la 3ème place' :
                                            title === '4f' ? 'Quarts de finale' :
                                                title === '8f' ? 'Huitièmes de finale' :
                                                    title === '16f' ? 'Seizièmes de finale' :
                                                        title === 'c' ? 'Consolante' :
                                                            title === 'p' ? 'Matchs de placement' : title}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
});

export default SportMatchesTab;
