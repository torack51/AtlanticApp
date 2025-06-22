import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

interface Delegation {
    id: string;
    title: string;
    image: string;
    color: string;
}

export const getAllDelegations = async(): Promise<any[]> => {
    try {
        const q = query(
            collection(db, 'atlanticup_delegations'),
            orderBy('title', 'asc'),
        );

        const querySnapshot = await getDocs(q);

        const delegations: any[] = [];
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