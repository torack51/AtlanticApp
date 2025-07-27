import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "@react-native-firebase/firestore";

const db = getFirestore();

export const getAllRankings = async (): Promise<any[]> => {
    const rankingsCol = collection(db, "rankings");
    const rankingSnapshot = await getDocs(rankingsCol);
    const rankingList = rankingSnapshot.docs.map(doc => doc.data());
    return rankingList;
}

export const getRankingBySportIdAndCategory = async (sport_id: string, category: string): Promise<any[]> => {
    const rankingsCol = collection(db, "rankings");
    const q = query(rankingsCol, where("sport_id", "==", sport_id), where("category", "==", category));
    const rankingSnapshot = await getDocs(q);
    const rankingList = rankingSnapshot.docs.map(doc => doc.data());
    return rankingList;
}