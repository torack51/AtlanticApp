import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

const AuthLayout: React.FC = () => {
    return (
        <Stack screenOptions={{headerShown : false}}>
              <Stack.Screen name="connexion" options={{}}/> {/* Pour les routes comme /matches/123 */}
        </Stack>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default AuthLayout;