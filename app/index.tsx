import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    const checkOnboarding = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');

        if (seen === 'false' || seen === null) {
            console.log('Redirecting to onboarding');
            router.replace('/(onboarding)');
        } else {
            console.log('Redirecting to tabs');
            router.replace('/(tabs)/calendar');
        }
    };

    checkOnboarding();
  }, []);

  return null;
}
