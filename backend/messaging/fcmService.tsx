import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const saveFcmToken = async (uid: string, fcmToken: string): Promise<void> => {
    await firestore().collection('users').doc(uid).set({
        fcmToken,
        createdAt: firestore.FieldValue.serverTimestamp()
    }, { merge: true });
};

export const checkNotificationPermission = async () => {
  const authStatus = await messaging().hasPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission enabled');
  } else {
    console.log('Notification permission NOT enabled');
  }
}