import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {PermissionsAndroid, Alert, AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  .then((granted) => {
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Permission granted', 'You can now receive notifications');
    } else {
      Alert.alert('Permission denied', 'You will not receive notifications');
    }
  });

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Notification reçue en foreground :', remoteMessage);
      Alert.alert('Notification!', remoteMessage.notification?.title);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const getToken = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        console.log('🔥 FCM Token:', token);
        Alert.alert("FCM Token", token);
        // Tu peux envoyer ce token à ton backend ici
      } else {
        console.warn("Notifications non autorisées");
      }
    };

    getToken();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <Stack
        initialRouteName="(tabs)"
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
        <Stack.Screen name="matches" options={{ headerTitle : "Détails du match", headerBackTitle : "Retour"}}/>
        <Stack.Screen name="events" options={{ headerTitle : "Détails de l'événement", headerBackTitle : "Retour"}}/>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
