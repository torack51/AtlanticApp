import { useFonts } from 'expo-font';
import { Stack , useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState} from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {PermissionsAndroid, Alert, AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { signInAnonymously } from '../backend/auth/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    signInAnonymously();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 Notification reçue en foreground :', remoteMessage);
      if (remoteMessage.notification && remoteMessage.notification.title) {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      }
      else{
        Alert.alert('Notification reçue', 'Vous avez reçu une notification sans titre ni corps.');
      }
    });


    messaging().subscribeToTopic('allUsers')
      .then(() => console.log('Abonné au topic allUsers !'))
      .catch(error => console.error('Erreur d\'abonnement au topic allUsers:', error));

    return unsubscribe;
  }, []);

  useEffect(() => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open', remoteMessage);
        }
      });
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
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <Stack
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="matches" options={{ headerTitle : "Détails du match", headerBackTitle : "Retour"}}/>
          <Stack.Screen name="events" options={{ headerTitle : "Détails de l'événement", headerBackTitle : "Retour"}}/>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}