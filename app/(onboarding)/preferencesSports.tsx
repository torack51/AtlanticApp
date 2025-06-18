import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSports } from '@/backend/firestore/sportsService';

const PreferencesSports = () => {

    const router = useRouter();

    const [sports, setSports] = React.useState<any[]>([]);
    const [selectedSports, setSelectedSports] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchSports = async () => {
        try {
            setLoading(true)
            const sports = await getAllSports();
            sports.map((sport: any) => {
                console.log("Sport fetched:", sport);
            });
            setSports(sports);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching sports:", error);
            setLoading(false);
        }
    };

    const continueOnboarding = async () => {
        // Here you can save the user's preferences or perform any final actions
        router.push('/(onboarding)/allowNotifications'); // Navigate to the home screen after finishing onboarding
    };

    React.useEffect(() => {
        fetchSports();
    }, []);

    console.log("Selected sports:", selectedSports);

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.title_container}>
                <Text style={styles.title}>Quels sports te font vibrer?</Text>
            </View>
            <View style={styles.team_selection_container}>
                <FlatList 
                    data={sports}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ alignItems:'center'}}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.sport_item, selectedSports.includes(item.id) && { backgroundColor: 'green' }]} 
                            onPress={() => {
                                if (selectedSports.includes(item.id)) {
                                    setSelectedSports(selectedSports.filter(id => id !== item.id));
                                } else {
                                    setSelectedSports([...selectedSports, item.id]);
                                }
                            }}
                        >
                            <Image source={{ uri: item.image }} style={styles.sport_image} />
                            <Text style={styles.sport_title}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
            <View style={styles.buttons_container}>        
                <Button mode="contained" onPress={() => router.back()}>
                    Revenir en arrière
                </Button>    
                <Button mode="contained" onPress={continueOnboarding}>
                    Terminer
                </Button>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title_container: {
        flex:1,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    team_selection_container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
    },
    sports_container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sport_item: {
        width: 250,
        height: 75,
        padding: 10,
        marginHorizontal: 20,
        marginVertical: 5,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    sport_image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    sport_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    buttons_container: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
});

export default PreferencesSports;