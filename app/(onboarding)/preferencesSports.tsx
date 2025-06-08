import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const PreferencesSports = () => {

    const router = useRouter();
    const finishBoarding = async () => {
        // Here you can save the user's preferences or perform any final actions
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(tabs)/calendar'); // Navigate to the home screen after finishing onboarding
    };

    return (
        <SafeAreaView style={styles.main_container}>
                    <View style={styles.title_container}>
                        <Text style={styles.title}>Quels sports te font vibrer?</Text>
                    </View>
                    <View style={styles.team_selection_container}>
                    
                    </View>
                    <View style={styles.buttons_container}>        
                        <Button mode="contained" onPress={() => router.back()}>
                            Revenir en arrière
                        </Button>    
                        <Button mode="contained" onPress={finishBoarding}>
                            Terminer
                        </Button>
                    </View>
        
                    {/* Add your preferences UI components here */}
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
        backgroundColor:'red',

    },
    buttons_container: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal:20,
    },
});

export default PreferencesSports;