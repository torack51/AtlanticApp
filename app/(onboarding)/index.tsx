import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';

interface IndexProps {
    // Add your props here
}

const Index: React.FC<IndexProps> = () => {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            <Text>Bienvenue dans l'AtlanticApp</Text>
            <Text>L'app officielle de l'Atlanticup</Text>
            <Text>Suivez les scores, les événements et plus encore!</Text>
            {/* Add your onboarding components here */}
            {/* For example, you can add a button to navigate to the welcome screen */}
            <Button mode="contained" style={{ marginTop: 20 }} onPress={() => router.push('/(onboarding)/presentation')}>
                Démarrer la visite
            </Button>
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

export default Index;