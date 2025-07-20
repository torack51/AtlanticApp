import { getAuth } from 'firebase/auth';
import auth, { FirebaseAuthTypes, deleteUser} from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';

export const deleteAnonymousAccount = async (oldUser : FirebaseAuthTypes.User) => {

    if (!(oldUser?.isAnonymous)){
        console.error("Aucun utilisateur anonyme connecté.");
        return;
    }

    try {
        await deleteUser(oldUser);
        console.log('Compte anonyme supprimé avec succès.');
    } catch (error) {
        console.error('Erreur lors de la suppression du compte :', error); 
    }

    try {
        await firestore().collection('users').doc(oldUser.uid).delete();
        console.log("Compte anonyme supprimé :", oldUser.uid);
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur dans la base de données :", error);
    }
};