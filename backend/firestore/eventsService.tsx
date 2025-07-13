import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

const PAGE_SIZE = 10;

export const getInitialEvents = async (): Promise<any[]> => {
    try {
        let q = query(
            collection(db, 'atlanticup_events'),
            orderBy('start_time', 'desc'),
            limit(PAGE_SIZE)
        );

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

export const fetchFlection = async (collectionName: string, lastTimestamp: any) => {
    const q = lastTimestamp
        ? query(collection(db, collectionName), orderBy('date'), startAfter(lastTimestamp), limit(PAGE_SIZE))
        : query(collection(db, collectionName), orderBy('date'), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
    return {
        docs: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
};

type FetchEventsParams = {
    lastDoc?: any | null;
    selectedSchool?: string | null;
    blackList?: string[] | null;
};

export const fetchNextPage = async ({ lastDoc, selectedSchool, blackList }: FetchEventsParams) => {
    const baseQuery = query(
        collection(db, 'atlanticup_matches'),
        orderBy('start_time', 'desc'),
        limit(PAGE_SIZE)
    );

    let q = lastDoc
        ? query(baseQuery, startAfter(lastDoc))
        : baseQuery;

    if (blackList && blackList.length > 0) {
        q = query(q, where('status', 'not-in', blackList));
    }


    const snapshot = await getDocs(q);
    return {
        docs: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, start_time: (doc.data().start_time as any).toDate() })),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
};

