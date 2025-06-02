import { View, StyleSheet } from 'react-native';
import React from 'react';

interface PreferencesProps {
    // Add your props here
}

const Preferences: React.FC<PreferencesProps> = () => {
    return (
        <View style={styles.container}>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Preferences;