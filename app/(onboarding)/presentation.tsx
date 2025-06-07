import { View, Text, StyleSheet} from 'react-native';
import { Button } from 'react-native-paper';
import React from 'react';
import { useRouter } from 'expo-router';

const Presentation = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text>Presentation Screen</Text>
            <Button mode="contained" onPress={() => router.push('/(onboarding)/preferencesSchool')}>
                Continue
            </Button>
            <Button mode="contained" onPress={() => router.back()}>
                Revenir en arrière
            </Button>
            {/* Add your presentation UI components here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Presentation;