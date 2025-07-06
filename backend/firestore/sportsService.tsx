import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

interface Category{
    ranking: string[];
    ranking_description: string;
    title: string;
    title_short: string;
}

interface Sport {
    id: string;
    image: string;
    title: string;
    categories: {[key: string]: Category};
}

export const getAllSports = async (): Promise<Sport[]> => {
    try {
        const q = query(
            collection(getFirestore(), 'atlanticup_sports'),
            orderBy('title', 'asc'),
        );

        const querySnapshot = await getDocs(q);

        const sports: Sport[] = [];
        querySnapshot.forEach((doc) => {
            const data = { 
                id: doc.id,
                ...doc.data()
            } as Sport;
             
            sports.push(data);
        }); 

        return sports;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des sports:", error);
        return [];
    }
}

export const getSportFromId = async (id: string): Promise<Sport> => {
    const docRef = doc(db, 'atlanticup_sports', id);
        const docSnap = await getDoc(docRef);
    
        if (!docSnap.exists) {
            console.log('No sport found with id:', id);
            throw new Error(`Sport with id ${id} not found`);
        }
    
        return { id, ...docSnap.data() } as Sport;
}