import { collection, where, getDoc, doc, getDocs, setDoc, updateDoc, getFirestore, query} from '@react-native-firebase/firestore';

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
