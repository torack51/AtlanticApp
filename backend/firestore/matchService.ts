import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

interface Match{
    id: string;
    category: string;
    description: string;
    place_id: string | null;
    sport_id: string;
    start_time: Date;
    status: string;
    team1_id: string;
    team2_id: string;
    team1_score: number | null;
    team2_score: number | null;
    kind: string;
    teams: any;
    title: string;
}

export const getMatchFromId = async (id: string): Promise<Match> => {
    try {
        const docRef = doc(db, 'atlanticup_matches', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists) {
            console.log('No sport found with id:', id);
            throw new Error(`Sport with id ${id} not found`);
        }

        const data =  { id, ...docSnap.data() } as Match;

        if (data.start_time) {
            data.start_time = (data.start_time as any).toDate();
        }
        return data;
    } catch (error) {
        console.error("Error fetching match:", error);
        throw error;
    }
}

export const getMatchesFromSportId = async (sportId: string, limitCount: number = 10, startAfterDate?: Date): Promise<Match[]> => {
    try {
        let q = query(
            collection(getFirestore(), 'atlanticup_matches'),
            where('sport_id', '==', sportId),
            orderBy('start_time', 'desc'),
            limit(limitCount)
        );

        if (startAfterDate) {
            q = query(q, startAfter(startAfterDate));
        }

        const querySnapshot = await getDocs(q);

        const matches: Match[] = [];
        querySnapshot.forEach((doc) => {
            const data = { 
                id: doc.id,
                ...doc.data()
            } as Match;

            if (data.start_time) {
                data.start_time = (data.start_time as any).toDate();
            }
             
            matches.push(data);
        }); 

        return matches;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matchs:", error);
        throw error;
    }
}

export const getMatchesFromSportIdAndCategory = async (sportId: string, categoryId: string, limitCount: number = 10, startAfterDate?: Date): Promise<Match[]> => {
    try {
        let q = query(
            collection(getFirestore(), 'atlanticup_matches'),
            where('sport_id', '==', sportId),
            where('category', '==', categoryId),
            orderBy('start_time', 'desc'),
            limit(limitCount)
        );

        if (startAfterDate) {
            q = query(q, startAfter(startAfterDate));
        }

        const querySnapshot = await getDocs(q);

        const matches: Match[] = [];
        querySnapshot.forEach((doc) => {
            const data = { 
                id: doc.id,
                ...doc.data()
            } as Match;

            if (data.start_time) {
                data.start_time = (data.start_time as any).toDate();
            }
             
            matches.push(data);
        }); 

        return matches;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matchs:", error);
        throw error;
    }
}