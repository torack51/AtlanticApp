import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

import { deleteAnonymousAccount } from './anonymousAuthService';

export const signInAnonymously = async () => {
  console.log("Tentative de connexion anonyme...");
  const userCredential = await auth().signInAnonymously();

  const uid = userCredential.user.uid;
  console.log('User signed in anonymously with UID:', uid);

  const userRef = firestore().collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    const fcmToken = await messaging().getToken();

    await userRef.set({
      followed_sports: [], // valeur par défaut
      supported_team: null, // valeur par défaut
      fcmToken,
      anonymous: true,
      platform: Platform.OS,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    console.log("Nouvel utilisateur anonyme créé :", uid);
  } else {
    console.log("Utilisateur anonyme déjà existant :", uid);
    // Update lastLogin date
    await userRef.update({
      lastLogin: new Date().toISOString(),
    });
  }
  console.log('Connexion anonyme réussie avec UID:', userCredential.user.uid);
  return userCredential.user.uid;
};

export const switchToAccountWithRights = async (email : string, password : string) => {
  const currentUser = auth().currentUser;
  const anonymousUid = currentUser?.isAnonymous ? currentUser.uid : null;

  try {
    let anonymousData: any = { followed_sports: [], supported_team: null };

    if (anonymousUid){
        const anonymousDoc = await firestore().collection('users').doc(anonymousUid).get();
        anonymousData = anonymousDoc.exists ? anonymousDoc.data() : { followed_sports: [], supported_team: null };
    }
    else{
        console.warn("Aucun compte anonyme à remplacer, il y a probablement eu une erreur précédemment.");
    }

    const oldUser = auth().currentUser;

    if (oldUser?.isAnonymous) {
      await deleteAnonymousAccount(oldUser);
    }

    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const uidFinal = userCredential.user.uid;

    const userDocRef = firestore().collection('users').doc(uidFinal);
    const docFinal = await userDocRef.get();

    const fcmToken = await messaging().getToken();

    if (!docFinal.exists) {
      await userDocRef.set({
        email: email,
        fcmToken: fcmToken,
        anonymous: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLogin: firestore.FieldValue.serverTimestamp(),
        platform: Platform.OS,
        followed_sports: anonymousData?.followed_sports || [],
        supported_team: anonymousData?.supported_team || null,
      });
    } else {
      await userDocRef.update({
        fcmToken: fcmToken,
        platform: Platform.OS,
        anonymous: false,
        lastLogin: firestore.FieldValue.serverTimestamp(),
        followed_sports: anonymousData?.followed_sports || [],
        supported_team: anonymousData?.supported_team || null,
      });
    }

    console.log("Passage au compte avec droits réussi.");
    
    return uidFinal;

  } catch (error) {
    console.error("Erreur lors du switch vers un compte avec droits :", error);
    signInAnonymously();
    throw error;
  }
};


export const switchToAnonymousAfterLogout = async () => {
  try {
    const currentUser = auth().currentUser;
    const uidPrecedent = currentUser?.uid;

    let previousData = { followed_sports: [], supported_team: null };
    if (uidPrecedent) {
      const doc = await firestore().collection('users').doc(uidPrecedent).get();
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          previousData = {
            followed_sports: data.followed_sports || [],
            supported_team: data.supported_team || null
          };
        }
      }
    }
    
    await auth().signOut();

    const userCredential = await auth().signInAnonymously();
    const uid = userCredential.user.uid;
    const fcmToken = await messaging().getToken();

    await firestore().collection('users').doc(uid).set({
      fcmToken: fcmToken,
      anonymous: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
      platform: Platform.OS,
      followed_sports: [],
      supported_team: null,
    });

    console.log("Nouveau compte anonyme créé après déconnexion.");
    return uid;

  } catch (error) {
    console.error("Erreur lors de la création d'un compte anonyme :", error);
    throw error;
  }
};


export const signOut = async () => {
  await auth().signOut();
};
