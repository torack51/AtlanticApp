import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

interface Team{
    id: string;
    category: string;
    description: string;
    sport : string;
    delegation_id: string;
}

export const getTeamFromId = async (id: string): Promise<Team> => {
    const docRef = doc(db, 'atlanticup_teams', id);
        const docSnap = await getDoc(docRef);
    
        if (!docSnap.exists) {
            console.log('No sport found with id:', id);
            throw new Error(`Sport with id ${id} not found`);
        }
    
        return { id, ...docSnap.data() } as Team;
}