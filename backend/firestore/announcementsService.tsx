import { collection, where, getDoc, doc, getDocs, setDoc, updateDoc, getFirestore, query, orderBy} from '@react-native-firebase/firestore';

interface Announcement {
    id : string;
    title: string;
    description: string;
    time_sent: string;
    place_id? : string;
}

const db = getFirestore();

export const getAnnouncementFromId = async (id: string): Promise<Announcement> => {
    const docRef = doc(db, 'atlanticup_announcements', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists) {
        console.log('No announcement found with id:', id);
        throw new Error(`Announcement with uid ${id} not found`);
    }

    const data = { id , ...docSnap.data() } as Announcement;
    if (data.time_sent) {
        data.time_sent = (data.time_sent as any).toDate();
    }

    return data;
}

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
    try {
        const q = query(
            collection(getFirestore(), 'atlanticup_announcements'),
            orderBy('time_sent', 'asc')
        );

        const querySnapshot = await getDocs(q);

        const announcements: Announcement[] = [];
        querySnapshot.forEach((doc) => {
            const data = { 
                id: doc.id,
                ...doc.data()
            } as Announcement;

            if (data.time_sent) {
                data.time_sent = (data.time_sent as any).toDate();
            }

            announcements.push(data);
        }); 

        return announcements;
    }
    catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }
}