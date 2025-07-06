import { collection, where, getDoc, doc, getDocs, setDoc, updateDoc, getFirestore, query, orderBy} from '@react-native-firebase/firestore';
interface Place {
    id: string;
    description: string;
    kind: string;
    title: string;
    position: any;
    sports_id_list: string[];
}

const db = getFirestore();


export const getPlaceFromId = async (id: string): Promise<Place> => {
    const docRef = doc(db, 'places', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists) {
        console.log('No user found with uid:', id);
        throw new Error(`User with uid ${id} not found`);
    }

    return { id, ...docSnap.data() } as Place;
}


export const getAllPlaces = async (): Promise<Place[]> => {
    try {
        const q = query(
            collection(getFirestore(), 'places'),
            orderBy('title', 'asc')
        );

        const querySnapshot = await getDocs(q);

        const delegations: Place[] = [];
        querySnapshot.forEach((doc) => {
            const data = { 
                id: doc.id,
                ...doc.data()
            } as Place;
             
            delegations.push(data);
        }); 

        return delegations;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des délégations:", error);
        return [];
    }
}