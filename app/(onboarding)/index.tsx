import { View, StyleSheet, Text, Image} from 'react-native';
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
            <View style={styles.top_part}>
                <Text style={styles.title}>Bienvenue dans l'AtlanticApp</Text>
            </View>
            
            <View style={styles.middle_part}>
                <Image source={require('@/assets/images/logo-atlanticup-no-background.png')} style={{ width: '100%', height: '100%'}} />
            </View>
            <View style={styles.bottom_part}>
                <Text style={styles.description}>Suivez les scores, annonces et plus encore!</Text>
                {/* Add your onboarding components here */}
                {/* For example, you can add a button to navigate to the welcome screen */}
                <Button mode="contained" style={{ marginTop: 20 }} onPress={() => router.push('/(onboarding)/presentation')}>
                    Démarrer la visite
                </Button>
            </View>
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    top_part: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginBottom: 20,
    },
    middle_part: {
        flex: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    bottom_part: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
});

export default Index;