import auth from '@react-native-firebase/auth';

export const signInAnonymously = async () => {
  const userCredential = await auth().signInAnonymously();
  return userCredential.user.uid;
};

export const signOut = async () => {
  await auth().signOut();
};
