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
        <SafeAreaView style={styles.container}>
            <Text>Preferences Sports Screen</Text>
            <Button mode="contained" onPress={finishBoarding}>
                Continue
            </Button>
            <Button mode="contained" onPress={() => router.back()}>
                Revenir en arrière
            </Button>
            {/* Add your preferences UI components here */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PreferencesSports;