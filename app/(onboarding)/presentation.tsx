import { View, Text, StyleSheet, Image} from 'react-native';
import { Button } from 'react-native-paper';
import React from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Presentation = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.title_container}>
                <Text style={styles.title}>Description</Text>
            </View>

            <View style={styles.team_selection_container}>
                {/* Add your team selection UI components here */}
            </View>
            <View style={styles.buttons_container}>
                <Button mode="contained" onPress={() => router.back()}>
                    Revenir en arrière
                </Button>
                <Button mode="contained" onPress={() => router.push('/(onboarding)/preferencesSchool')}>
                    Suivant
                </Button>
            </View>
            {/* Add your presentation UI components here */}
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
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
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

export default Presentation;