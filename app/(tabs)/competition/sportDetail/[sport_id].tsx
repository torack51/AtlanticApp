import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar} from 'react-native-tab-view';
import { useLocalSearchParams } from 'expo-router';

import ResultsTab from './ResultsTab';
import SportMatchesTab from './SportMatchesTab';

const initialLayout = { width: Dimensions.get('window').width };

const SportDetailScreen: React.FC = () => {
    const { sport_id, name} = useLocalSearchParams();
    const params = useLocalSearchParams();

    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const handleIndexChange = (index: number) => {
        console.log('index', index);
        setIndex(index);
    }
    const [routes] = useState<{ key: string; title: string }[]>([
        { key: "rencontres", title: "Rencontres" },
        { key: "results", title: "Résultats" },
    ]);

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={SceneMap({
                rencontres: () => <SportMatchesTab sport_id={sport_id}/>,
                results: () => <ResultsTab sport_id={sport_id}/>,
            }
            )}
            onIndexChange={handleIndexChange}
            initialLayout={{width: layout.width}}
            style={{flex: 1}}
        >
        </TabView>
    );
};

const styles = StyleSheet.create({});

export default SportDetailScreen;
