import firestore, { Filter } from "@react-native-firebase/firestore";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, query, limit, orderBy, startAfter, where } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


async function atlanticupGetAllDelegations(): Promise<any[]> {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_delegations')
            .get();

        const delegations: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = {
                id: doc.id,
                ...doc.data()
            };
            delegations.push(data);
        });

        return delegations;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des délégations:", error);
        return [];
    }
}

async function atlanticupGetDelegationFromId(delegation_id: string): Promise<any> {
    try {
        const doc = await firestore()
            .collection('atlanticup_delegations')
            .doc(delegation_id)
            .get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
}

async function atlanticupGetAllSports(): Promise<any[]> {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_sports')
            .get();

        const sports: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = {
                id: doc.id,
                ...doc.data()
            };
            sports.push(data);
        });

        return sports;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des sports:", error);
        return [];
    }
}

async function atlanticupGetSportFromId(sport_id: string): Promise<any> {
    try {
        const doc = await firestore()
            .collection('atlanticup_sports')
            .doc(sport_id)
            .get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
}

async function atlanticupGetTeamFromId(team_id: string): Promise<any> {
    try {
        const doc = await firestore()
            .collection('atlanticup_teams')
            .doc(team_id)
            .get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
}

async function atlanticupGetMatchesFromSportId(sport_id: string): Promise<any[]> {

    try {
        const teamsDic = await atlanticupGetAllTeams();
        const delegationsDic = await atlanticupGetAllDelegations();

        // Associer les délégations aux équipes
        teamsDic.forEach((team) => {
            const delegation = delegationsDic.find((delegation) => delegation.id == team.delegation);
            if (delegation) {
                team.delegation = delegation;
            }
        });

        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .where('sport_id', '==', sport_id)
            .get();

        const matches: any[] = [];
        querySnapshot.forEach((doc) => {
            const data:any = {
                id: doc.id,
                ...doc.data()
            };
            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }
            try {
                data.end_time = data.end_time.toDate().toISOString();
            } catch (error) {
                data.end_time = null;
            }

            if (data.sport_id === sport_id) {
                matches.push(data);
            }

            let teams = teamsDic.filter((team) => team.id == data.team1_id || team.id == data.team2_id);
            if (teams.length == 0 && data.kind == 'match') {
                teams = data.teams_id.map((team_id: string) => teamsDic.find((team) => team.id == team_id));
            }
            data.teams = teams;
        });

        return matches;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return [];
    }
}

const atlanticupGetPlaceFromId = async (id: string): Promise<any> => {
    try {
        const doc = await firestore()
            .collection('atlanticup_places')
            .doc(id)
            .get();

        if (doc.exists) {
            const data = {
                id: doc.id,
                ...doc.data()
            };
            return data;
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
};


const atlanticupGetAllGroups = async (): Promise<any[]> => {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_groups')
            .get();

        const groups: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = {
                id: doc.id,
                ...doc.data()
            };
            groups.push(data);
        });

        return groups;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des groupes:", error);
        return [];
    }
};

const atlanticupGetGroupsFromSportId = async (sport_id: string): Promise<any[]> => {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_groups')
            .where('sport', '==', sport_id)
            .get();

        const groups: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = {
                id: doc.id,
                ...doc.data()
            };
            groups.push(data);
        });

        return groups;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des groupes:", error);
        return [];
    }
};

const atlanticupGetMatchesFromTeamId = async (team_id: string): Promise<any[]> => {
    try {
        const teamsDic = await atlanticupGetAllTeams();
        const delegationsDic = await atlanticupGetAllDelegations();

        // Associer les délégations aux équipes
        teamsDic.forEach((team) => {
            const delegation = delegationsDic.find((delegation) => delegation.id == team.delegation);
            if (delegation) {
                team.delegation = delegation;
            }
        });

        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .where(
                Filter.or(
                    Filter('team1_id', '==', team_id),
                    Filter('team2_id', '==', team_id)
                )
            )
            .get();

        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            const data: any = {
                id: doc.id,
                ...doc.data(),
            };

            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }

            const teams = teamsDic.filter((team) => team.id == data.team1_id || team.id == data.team2_id);
            data.teams = teams;
            items.push(data);
        });

        const filteredItems = items.filter(item => item.status != "cancelled");

        return filteredItems;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return [];
    }
};

const atlanticupGetInitialEvents = async (itemsPerPage: number): Promise<{ items: any[], lastVisible: any }> => {
    try {
        const teamsDic = await atlanticupGetAllTeams();
        const delegationsDic = await atlanticupGetAllDelegations();

        // Associer les délégations aux équipes
        teamsDic.forEach((team) => {
            const delegation = delegationsDic.find((delegation) => delegation.id == team.delegation);
            if (delegation) {
                team.delegation = delegation;
            }
        });

        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .orderBy('start_time')
            .limit(itemsPerPage)
            .get();

        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            const data: any = {
                id: doc.id,
                ...doc.data(),
            };

            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }

            const teams = teamsDic.filter((team) => team.id == data.team1_id || team.id == data.team2_id);
            data.teams = teams;
            items.push(data);
        });

        const filteredItems = items.filter(item => item.status != "cancelled");
        const lastVisibleItem = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { items: filteredItems, lastVisible: lastVisibleItem };
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return { items: [], lastVisible: null };
    }
}

const atlanticupGetInitialIncomingEvents = async (itemsPerPage: number): Promise<{ items: any[], lastVisible: any }> => {
    try {
        const teamsDic = await atlanticupGetAllTeams();
        const delegationsDic = await atlanticupGetAllDelegations();

        // Associer les délégations aux équipes
        teamsDic.forEach((team) => {
            const delegation = delegationsDic.find((delegation) => delegation.id == team.delegation);
            if (delegation) {
                team.delegation = delegation;
            }
        });

        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .orderBy('start_time')
            .where('status', '!=', 'played')
            .limit(itemsPerPage)
            .get();

        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            const data: any = {
                id: doc.id,
                ...doc.data(),
            };

            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }

            const teams = teamsDic.filter((team) => team.id == data.team1_id || team.id == data.team2_id);
            data.teams = teams;
            items.push(data);
        });

        const filteredItems = items.filter(item => item.status != "cancelled");
        const lastVisibleItem = filteredItems[filteredItems.length - 1];

        return { items: filteredItems, lastVisible: lastVisibleItem };
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return { items: [], lastVisible: null };
    }
};

 
const atlanticupGetMoreEvents = async (lastVisible: any, itemsPerPage: number): Promise<{ items: any[], lastVisible: any }> => {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .orderBy('start_time')
            .startAfter(lastVisible)
            .limit(itemsPerPage)
            .get();

        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            const data:any = {
                id: doc.id,
                ...doc.data()
            };
            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }

            items.push(data);
        });

        const filteredItems = items.filter(item => item.status != "cancelled");
        const lastVisibleItem = filteredItems[filteredItems.length - 1];

        return { items: filteredItems, lastVisible: lastVisibleItem };
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return { items: [], lastVisible: null };
    }
}


const atlanticupGetMoreIncomingEvents = async (lastVisible: any, itemsPerPage: number): Promise<{ items: any[], lastVisible: any }> => {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .where('status', '!=', 'played')
            .orderBy('status')
            .orderBy('start_time')
            .startAfter(lastVisible)
            .limit(itemsPerPage)
            .get();


        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            const data:any = {
                id: doc.id,
                ...doc.data()
            };
            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }

            items.push(data);
        });

        const filteredItems = items.filter(item => item.status != "cancelled");
        const lastVisibleItem = filteredItems[filteredItems.length - 1];
        return { items: filteredItems, lastVisible: lastVisibleItem };
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return { items: [], lastVisible: null };
    }
}

const atlanticupGetEventFromId = async (event_id: string): Promise<any> => {
    try {
        const doc = await firestore()
            .collection('atlanticup_matches')
            .doc(event_id)
            .get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
}

const atlanticupGetMatchFromId = async (match_id: string): Promise<any> => {
    try {
        const doc = await firestore()
            .collection('atlanticup_matches')
            .doc(match_id)
            .get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
}

const atlanticupGetEventsFromPlaceId = async (itemsPerPage: number, place_id: string, lastVisible: any): Promise<{ items: any[], lastVisible: any }> => {
    try {
        const querySnapshot = await firestore()
            .collection('atlanticup_matches')
            .where('place_id', '==', place_id)
            .orderBy('start_time')
            .startAfter(lastVisible)
            .limit(itemsPerPage)
            .get();

        const items: any[] = [];
        querySnapshot.forEach((doc) => {
            const data:any = {
                id: doc.id,
                ...doc.data()
            };
            try {
                data.start_time = data.start_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
            }

            items.push(data);
        });

        const lastVisibleItem = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { items, lastVisible: lastVisibleItem };
    }
    catch (error) {
        console.error("Erreur lors de la récupération des matches:", error);
        return { items: [], lastVisible: null };
    }
}

const atlanticupGetAllAnnouncements = async (): Promise<any[]> => {
    try {
        const querySnapshot = await firestore().collection('atlanticup_announcements').orderBy('time_sent', 'desc').get();
        const announcements: any[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        return announcements;
    }
    catch (error) {
        console.error("Erreur lors de la récupération des annonces:", error);
        return [];
    }
}

const atlanticupGetAllTeams = async (): Promise<any[]> => {
    try {
        const querySnapshot = await firestore().collection('atlanticup_teams').get();
        const teams: any[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        return teams;
    } catch (error) {
        console.error("Erreur lors de la récupération des équipes:", error);
        return [];
    }
};


const atlanticupGetUserFromId = async (user_id: string): Promise<any> => {
    try {
        const doc = await firestore().collection('users').doc(user_id).get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
}

const atlanticupUpdateMatchStatus = async (match_id: string, status: string): Promise<void> => {
    try {
        await firestore()
            .collection('atlanticup_matches')
            .doc(match_id)
            .update({
                status: status
            });
    }
    catch (error) {
        console.error("Error updating document: ", error);
    }
}

const atlanticupUpdateType1MatchScore = async (match_id: string, score1: number, score2: number): Promise<void> => {
    try {
        await firestore()
            .collection('atlanticup_matches')
            .doc(match_id)
            .update({
                team1_score: score1,
                team2_score: score2
            });
    }
    catch (error) {
        console.error("Error updating document: ", error);
    }
}

const atlanticupUpdateType2MatchScore = async (match_id: string, score1: number[], score2: number[]): Promise<void> => {
    try {
        await firestore()
            .collection('atlanticup_matches')
            .doc(match_id)
            .update({
                team1_score: score1,
                team2_score: score2
            });
    }
    catch (error) {
        console.error("Error updating document: ", error);
    }
}

const atlanticupUpdateType3MatchScore = async (match_id: string, ranking: any): Promise<void> => {
    try {
        await firestore()
            .collection('atlanticup_matches')
            .doc(match_id)
            .update({
                ranking: ranking
            });
    }
    catch (error) {
        console.error("Error updating document: ", error);
    }
}

const atlanticupFetchRanking = async (): Promise<any> => {
    try {
        const doc = await firestore()
            .collection('atlanticup_ranking')
            .doc('ranking')
            .get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
    }
}

export {
    atlanticupGetAllDelegations,
    atlanticupGetDelegationFromId,
    atlanticupGetTeamFromId,
    atlanticupGetAllSports,
    atlanticupGetSportFromId,
    atlanticupGetMatchesFromSportId,
    atlanticupGetPlaceFromId,
    atlanticupGetGroupsFromSportId,
    atlanticupGetAllGroups,
    atlanticupGetMatchesFromTeamId,
    atlanticupGetInitialEvents,
    atlanticupGetInitialIncomingEvents,
    atlanticupGetMoreEvents,
    atlanticupGetMoreIncomingEvents,
    atlanticupGetEventsFromPlaceId,
    atlanticupGetAllAnnouncements,
    atlanticupGetAllTeams,
    atlanticupGetEventFromId,
    atlanticupGetMatchFromId,
    atlanticupGetUserFromId,
    atlanticupUpdateMatchStatus,
    atlanticupUpdateType1MatchScore,
    atlanticupUpdateType2MatchScore,
    atlanticupUpdateType3MatchScore,
    atlanticupFetchRanking,
}
