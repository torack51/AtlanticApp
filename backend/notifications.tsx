import messaging from '@react-native-firebase/messaging';

export const getFcmToken = async () => {
  const token = await messaging().getToken();
  return token;
};
