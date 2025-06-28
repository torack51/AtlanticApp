import { collection, where, getDoc, doc, getDocs, setDoc, updateDoc, getFirestore, query} from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
interface User {
    uid: string;
    anonymous: boolean;
    fcmToken:string;
    followed_sports: string[];
    supported_team: string | null;
    lastLogin : Date;
    registrationDate: Date;
    platform: 'android' | 'ios' | 'web';
    email?: string;
    firstName?: string;
    lastName?: string;
    // Add any other user properties you need
}

const db = getFirestore();


/**
 * Get a user document by UID from Firestore
 * @param uid User ID
 * @returns User object or null if not found
 */
export const getUserByUid = async (uid: string): Promise<User | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists) {
        console.log('No user found with uid:', uid);
        return null;
    }

    return { uid, ...docSnap.data() } as User;
}

/**
 * Create a new user document in Firestore
 * @param user User information
 */
export const createUser = async (user: User): Promise<void> => {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, user);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Update an existing user document in Firestore
 * @param uid User ID
 * @param data Data to update
 */
export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export const updateUserSupportedTeam = async (uid: string, teamId: string | null): Promise<void> => {
    try {
        const formerSupportedTeam = (await getUserByUid(uid))?.supported_team || null;
        formerSupportedTeam ? await messaging().unsubscribeFromTopic(formerSupportedTeam) : null;
        teamId ? await messaging().subscribeToTopic(teamId) : null;

        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {supported_team: teamId});
    } catch (error) {
        console.error('Error updating user supported team:', error);
        throw error;
    }
}

export const updateUserFollowedSports = async (uid: string, sportsId : string[]): Promise<void> => {
    try {
        const formerFollowedSports = (await getUserByUid(uid))?.followed_sports || [];
        formerFollowedSports.forEach(async (sportId) => {
            if (sportId) {
                await messaging().unsubscribeFromTopic(sportId);
            }
        });
        sportsId.forEach(async (sportId) => {
            if (sportId) {
                console.log('Subscribing to topic:', sportId);
                await messaging().subscribeToTopic(sportId);
            }
        });

        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {followed_sports: sportsId});
    } catch (error) {
        console.error('Error updating user followed sports:', error);
        throw error;
    }
}