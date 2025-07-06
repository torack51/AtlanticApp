import { collection, where, getDoc, doc, getDocs, setDoc, updateDoc, getFirestore, query, orderBy} from '@react-native-firebase/firestore';
interface Delegation {
    id : string;
    title: string;
    color: string;
    image: string;
}

const db = getFirestore();


export const getDelegationFromId = async (id: string): Promise<Delegation> => {
    const docRef = doc(db, 'atlanticup_delegations', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists) {
        console.log('No delegation found with id:', id);
        throw new Error(`Delegation with uid ${id} not found`);
    }

    return { id, ...docSnap.data() } as Delegation;
}


export const getAllDelegations = async (): Promise<Delegation[]> => {
    try {
        const q = query(
            collection(getFirestore(), 'atlanticup_delegations'),
            orderBy('title', 'asc')
        );

        const querySnapshot = await getDocs(q);

        const delegations: Delegation[] = [];
        querySnapshot.forEach((doc) => {
            const data = { 
                id: doc.id,
                ...doc.data()
            } as Delegation;
             
            delegations.push(data);
        }); 

        return delegations;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des délégations:", error);
        return [];
    }
}