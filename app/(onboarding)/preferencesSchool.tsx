import { View, StyleSheet, Text} from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PreferencesProps {
    // Add your props here
}

const Preferences: React.FC<PreferencesProps> = () => {
    const router = useRouter();

    const continueOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(onboarding)/preferencesSports');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text>Preferences Screen</Text>
            <Button mode="contained" onPress={continueOnboarding}>
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

export default Preferences;