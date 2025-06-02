import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import App from './app';

// Handler pour les notifications en arrière-plan
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Message reçu en arrière-plan:', remoteMessage);
});

registerRootComponent(App);
