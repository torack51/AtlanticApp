import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where, or } from "@react-native-firebase/firestore";

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

type FetchEventsParams = {
    lastDoc: any | null;
    selectedSchool: string | null;
    blackList: string[] | null;
};

export const fetchNextPage = async ({ lastDoc = null, selectedSchool = null, blackList = []}: FetchEventsParams) => {
    console.log("Fetching next page with params:", { lastDoc, selectedSchool, blackList });

    let q = query(
        collection(db, 'atlanticup_matches'),
        orderBy('start_time', 'asc'),
        limit(PAGE_SIZE)
    );

    if (lastDoc && lastDoc.id) {
        (q = query(q, startAfter(lastDoc)));
    }

    if (blackList && blackList.length > 0) {
        (q = query(q, where('status', 'not-in', blackList)));
    }

    const qEvents = query(q, where('kind', '==', 'event'));

    if (selectedSchool!== null && selectedSchool !== 'null') {
        (q = query(q, where('delegations_id', 'array-contains', selectedSchool)));
    }
    
    const [snap1, snap2] = await Promise.all([
        getDocs(q),
        getDocs(qEvents)
    ]);

    const docsMap = new Map();

    [...snap1.docs, ...snap2.docs].forEach((doc) => {
        if (!docsMap.has(doc.id)) {
            docsMap.set(doc.id, {
            ...doc.data(),
            id: doc.id,
            start_time: (doc.data().start_time as any)?.toDate?.() ?? null
            });
        }
    });

    const mergedDocs = Array.from(docsMap.values());

    mergedDocs.sort((a, b) => a.start_time?.getTime?.() - b.start_time?.getTime?.());


    
    return {
        docs: mergedDocs,
        lastDoc: mergedDocs.length ? mergedDocs[mergedDocs.length - 1] : null
    };
};

