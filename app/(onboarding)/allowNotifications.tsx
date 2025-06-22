import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllowNotifications = () => {
    const router = useRouter();
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const authStatus = await messaging().hasPermission();
        const enabled = 
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        setPermissionGranted(enabled);
    };

    const requestPermission = async () => {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled = 
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            
            setPermissionGranted(enabled);
            
            if (enabled) {
                getFcmToken();
            }
        } catch (error) {
            console.log('Permission request failed', error);
        }
    };

    const getFcmToken = async () => {
        try {
            const token = await messaging().getToken();
            if (token) {
                console.log('FCM Token:', token);
                // TODO: Send token to your server
            }
        } catch (error) {
            console.log('Error getting FCM token:', error);
        }
    };

    const handleContinue = async () => {
        if (permissionGranted) {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true'); // Save preference
            router.replace('/(tabs)/calendar'); // Navigate to the next screen
        } else {
            requestPermission();
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true'); // Save preference
        router.replace('/(tabs)/calendar'); // Navigate to the next screen without permissions
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Autoriser l'envoi de notifications</Text>
                <Text style={styles.description}>
                    Autorise les notifications pour recevoir des rappels importants, des mises à jour et des alertes concernant les événements sportifs.
                </Text>
                
                <TouchableOpacity 
                    style={styles.primaryButton} 
                    onPress={handleContinue}
                >
                    <Text style={styles.primaryButtonText}>
                        {permissionGranted ? 'Suivant' : 'Activer les notifications'}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={handleSkip}
                >
                    <Text style={styles.secondaryButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        color: '#666',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AllowNotifications;