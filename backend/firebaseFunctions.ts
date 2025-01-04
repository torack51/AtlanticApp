import  {getApp} from "@react-native-firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { Image } from 'react-native-compressor';

interface Activity {
    id: string;
    [key: string]: any;
}

interface Category {
    id: string;
    [key: string]: any;
}

interface Event {
    id: string;
    activity_id: string;
    start_time: string;
    end_time: string;
    id_owner?: string | null;
    participant_id?: string[];
    number_of_participants?: number;
    [key: string]: any;
}

interface Organizer {
    id: string;
    activity_id: string;
    user_id: string;
    [key: string]: any;
}

interface Participation {
    id: string;
    event_id: string;
    user_id: string;
}

interface Subscription {
    id: string;
    user_id: string;
    activity_id: string;
}

interface User {
    id: string;
    email_adress: string;
    subscribedEvents?: string[];
    subscribedActivities?: string[];
    [key: string]: any;
}

interface Place {
    id: string;
    [key: string]: any;
}

interface Occupation {
    id: string;
    start_time: string;
    end_time: string;
    [key: string]: any;
}

const app = getApp();
const db = getFirestore(app);
const storage = getStorage(app);

async function getAllActivities(): Promise<Activity[]> {
    const activitiesCollectionRef = collection(db, "activities");
    const querySnapshot = await getDocs(activitiesCollectionRef);
    const activities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return activities;
}

async function getAllCategories(): Promise<Category[]> {
    const categoriesCollectionRef = collection(db, "categories");
    const querySnapshot = await getDocs(categoriesCollectionRef);
    const categories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return categories;
}

async function getAllEvents(): Promise<Event[]> {
    const eventsCollectionRef = collection(db, "events");
    const querySnapshot = await getDocs(eventsCollectionRef);
    const events = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
            const data: Event = {
                id: doc.id,
                ...doc.data(),
                activity_id: doc.data().activity_id,
            };
            try {
                data.start_time = data.start_time.toDate().toISOString();
                data.end_time = data.end_time.toDate().toISOString();
            } catch (error) {
                data.start_time = new Date().toISOString();
                data.end_time = new Date().toISOString();
            }
            return data;
        })
    );

    const organizers = await getAllOrganizers();

    events.map((event) => {
        const organizer = organizers.find(
            (item) => item.activity_id == event.activity_id
        );
        event.id_owner = organizer ? organizer.user_id : null;
    });

    const participations = await getAllParticipations();
    events.map((event) => {
        event.participant_id = participations
            .filter((participation) => participation.event_id == event.id)
            .map((participation) => participation.user_id);
        event.number_of_participants = event.participant_id.length;
    });

    return events;
}

async function getEventFromId(event_id: string): Promise<Event | null> {
    const events = await getAllEvents();
    const event = events.find((event) => event.id == event_id);
    if (!event) {
        console.error('Aucun événement trouvé avec cet ID.');
        return null;
    }
    return event;
}

async function getSubscribedEvents(user_id: string): Promise<Participation[]> {
    const participations = await getAllParticipations();
    const subscribedEvents = participations.filter((participation) => participation.user_id == user_id);
    return subscribedEvents;
}

async function getAllOrganizers(): Promise<Organizer[]> {
    const organizersCollectionRef = collection(db, "organizers");
    const querySnapshot = await getDocs(organizersCollectionRef);
    const organizers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        activity_id: doc.data().activity_id,
        user_id: doc.data().user_id,
    }));
    return organizers;
}

async function getAllParticipations(): Promise<Participation[]> {
    const participationsCollectionRef = collection(db, "participations");
    const querySnapshot = await getDocs(participationsCollectionRef);
    const participations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        event_id: doc.data().event_id,
        user_id: doc.data().user_id,
    }));
    return participations;
}

async function getParticipationsFromUserId(user_id: string): Promise<string[]> {
    const participations = await getAllParticipations();
    const userParticipations = participations.filter((participation) => participation.user_id == user_id).map((participation) => participation.event_id);
    return userParticipations;
}

async function getAllSubscriptions(): Promise<Subscription[]> {
    const subscriptionsCollectionRef = collection(db, "subscriptions");
    const querySnapshot = await getDocs(subscriptionsCollectionRef);
    const subscriptions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        user_id: doc.data().user_id,
        activity_id: doc.data().activity_id,
    }));
    return subscriptions;
}

async function getSubscriptionsFromUserId(user_id: string): Promise<string[]> {
    const subscriptions = await getAllSubscriptions();
    const userSubscriptions = subscriptions.filter((subscription) => subscription.user_id == user_id).map((subscription) => subscription.activity_id);
    return userSubscriptions;
}

async function getAllUsers(): Promise<User[]> {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return users;
}

async function getUserData(email: string): Promise<User | undefined> {
    const users = await getAllUsers();
    const user = users.find((user) => user.email_adress == email);

    if (!user) return undefined;

    const participations = await getAllParticipations();
    const subscriptions = await getAllSubscriptions();

    const subscribedEvents = participations
        .filter((participation) => participation.user_id == user.id)
        .map((participation) => participation.event_id);
    const subscribedActivities = subscriptions
        .filter((subscription) => subscription.user_id == user.id)
        .map((subscription) => subscription.activity_id);

    user.subscribedEvents = subscribedEvents;
    user.subscribedActivities = subscribedActivities;

    return user;
}

async function getUserDataFromId(user_id: string): Promise<User | undefined> {
    const users = await getAllUsers();
    const user = users.find((user) => user.id == user_id);
    return user;
}

const getPlaceFromId = async (id: string): Promise<Place | null> => {
    try {
        const docRef = doc(db, 'places', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            console.log("Aucun document trouvé avec cet ID.");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du document:", error);
        return null;
    }
};

async function getActivityFromId(activity_id: string): Promise<Activity | undefined> {
    const activities = await getAllActivities();
    const activity = activities.find((activity) => activity.id == activity_id);
    return activity;
}

async function uploadProfilePicture(image_uri: string, user_id: string): Promise<string | null> {
    try {
        const resized_image = await Image.compress(
            image_uri,
            {
                compressionMethod: 'auto',
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.8,
            }
        );
        const response = await fetch(resized_image);
        const blob = await response.blob();

        const storageRef = ref(storage, `profilePictures/${user_id}.jpg`);
        await uploadBytes(storageRef, blob);
        return resized_image;
    } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image de profil : ', error);
        return null;
    }
}

async function getProfilePicture(user_id: string): Promise<string | null> {
    const storageRef = ref(storage, `profilePictures/${user_id}.jpg`);
    try {
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        const defaultStorageRef = ref(storage, `profilePictures/default.jpg`);
        try {
            const downloadURL = await getDownloadURL(defaultStorageRef);
            return downloadURL;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'image de profil : ', error);
            return null;
        }
    }
}

async function removeProfilePicture(user_id: string): Promise<string | null> {
    const storageRef = ref(storage, `profilePictures/${user_id}.jpg`);
    try {
        await deleteObject(storageRef);
        return getProfilePicture(user_id);
    } catch (error) {
        return getProfilePicture(user_id);
    }
}

async function getAllOccupations(): Promise<Occupation[]> {
    const occupationsCollectionRef = collection(db, "occupations");
    const querySnapshot = await getDocs(occupationsCollectionRef);
    const occupations = querySnapshot.docs.map((doc) => {
        const data: Occupation = {
            id: doc.id,
            ...doc.data(),
        };
        try {
            data.start_time = data.start_time.toDate().toISOString();
            data.end_time = data.end_time.toDate().toISOString();
        } catch (error) {
            data.start_time = new Date().toISOString();
            data.end_time = new Date().toISOString();
        }
        return data;
    });
    return occupations;
}

async function getOccupationsFromId(place_id: string): Promise<Occupation[]> {
    const occupations = await getAllOccupations();
    const currentOccupations = occupations.filter((occupation) => occupation.place_id == place_id);
    return currentOccupations;
}

async function getEventsFromPlaceId(place_id: string): Promise<Event[]> {
    const events = await getAllEvents();
    return events;
}

async function getEventsFromActivityId(activity_id: string): Promise<Event[]> {
    const events = await getAllEvents();
    const eventsFromActivity = events.filter((event) => event.activity_id == activity_id);
    return eventsFromActivity;
}

async function toggleEventParticipation(event_id: string, user_id: string): Promise<number> {
    const participations = await getAllParticipations();
    const participation = participations.find((participation) => participation.event_id == event_id && participation.user_id == user_id);
    if (participation) {
        const docRef = doc(db, 'participations', participation.id);
        await deleteDoc(docRef);
        return -1;
    } else {
        await addDoc(collection(db, 'participations'), { event_id, user_id });
        return 1;
    }
}

async function toggleActivitySubscription(activity_id: string, user_id: string): Promise<number> {
    const subscriptions = await getAllSubscriptions();
    const subscription = subscriptions.find((subscription) => subscription.activity_id == activity_id && subscription.user_id == user_id);
    if (subscription) {
        const docRef = doc(db, 'subscriptions', subscription.id);
        await deleteDoc(docRef);
        return -1;
    } else {
        await addDoc(collection(db, 'subscriptions'), { activity_id, user_id });
        return 1;
    }
}

async function getOrganizersFromActivityId(activity_id: string): Promise<string[]> {
    const organizers = await getAllOrganizers();
    const organizersFromActivity = organizers.filter((organizer) => organizer.activity_id == activity_id).map((organizer) => organizer.user_id);
    return organizersFromActivity;
}

async function getParticipationsFromEventId(event_id: string): Promise<string[]> {
    const participations = await getAllParticipations();
    const participationsFromEvent = participations.filter((participation) => participation.event_id == event_id).map((participation) => participation.user_id);
    return participationsFromEvent;
}

async function getSubscriptionsFromActivityId(activity_id: string): Promise<string[]> {
    const subscriptions = await getAllSubscriptions();
    const subscriptionsFromActivity = subscriptions.filter((subscription) => subscription.activity_id == activity_id).map((subscription) => subscription.user_id);
    return subscriptionsFromActivity;
}

export {
    getAllEvents,
    getEventFromId,
    getSubscribedEvents,
    getAllActivities,
    getAllCategories,
    getAllUsers,
    getUserData,
    getUserDataFromId,
    getPlaceFromId,
    getActivityFromId,
    uploadProfilePicture,
    getProfilePicture,
    removeProfilePicture,
    getAllOccupations,
    getOccupationsFromId,
    getEventsFromPlaceId,
    getEventsFromActivityId,
    getOrganizersFromActivityId,
    toggleEventParticipation,
    toggleActivitySubscription,
    getParticipationsFromUserId,
    getSubscriptionsFromUserId,
    getParticipationsFromEventId,
    getSubscriptionsFromActivityId,
};