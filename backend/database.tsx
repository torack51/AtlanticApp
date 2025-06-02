import firestore from '@react-native-firebase/firestore';

export const saveFcmToken = async (uid: string, fcmToken: string): Promise<void> => {
    await firestore().collection('users').doc(uid).set({
        fcmToken,
        createdAt: firestore.FieldValue.serverTimestamp()
    }, { merge: true });
};
