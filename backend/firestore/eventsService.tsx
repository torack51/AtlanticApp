import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

const PAGE_SIZE = 10;

export const getInitialEvents = async (startAfterDate?: Date): Promise<any[]> => {
    try {
        let q = query(
            collection(db, 'atlanticup_events'),
            orderBy('start_time', 'desc'),
            limit(PAGE_SIZE)
        );

        if (startAfterDate) {
            q = query(q, startAfter(startAfterDate));
        }

        const querySnapshot = await getDocs(q);
        const events: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            events.push(data);
        });

        return events;
    } catch (error) {
        console.error("Error fetching initial events:", error);
        throw error;
    }
}