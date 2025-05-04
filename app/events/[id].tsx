import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { atlanticupGetPlaceFromId, atlanticupGetEventFromId} from '../../backend/atlanticupBackendFunctions';
import LinearGradient from 'react-native-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Event {
    title: string;
    description: string;
    start_time: string;
    place_id: string | null;
}

interface Location {
    title: string;
}

const EventPage: React.FC = () => {
    const [event, setEvent] = useState<Event | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const router = useRouter();
    const {event_id} = useLocalSearchParams();

    useEffect(() => {
        fetchEvent();
    }, [event_id]);

    useEffect(() => {
        fetchLocation();
    }, [event]);

    const fetchLocation = async () => {
        if (event?.place_id) {
            const location = await atlanticupGetPlaceFromId(event.place_id);
            setLocation(location);
        }
    };

    const fetchEvent = async () => {
        if (typeof event_id === 'string') {
            const event = await atlanticupGetEventFromId(event_id);
            setEvent(event);
        }
        else{
            console.warn('event_id is not a string');
        }
    }

    const redirectToMap = () => {
        // router.push('Carte', { redirect_to_place_id: event?.place_id });
    };

    const timestampToMilliseconds = (timestamp: any) => {
        const milliseconds = timestamp.seconds * 1000;
        const totalMilliseconds = milliseconds + timestamp.nanoseconds / 1e6;
        return totalMilliseconds;
    };

    console.log('event : ', event)

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['rgba(27,73,102,0.7)', 'rgba(255,219,35,0.9)']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.big_text}>{event?.title}</Text>
                </View>
                <View style={styles.description_container}>
                    <Text style={[styles.small_text, { fontWeight: '300' }]}>{event?.description.replace(/\\n/g, "\n")}</Text>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.small_text}>{event ? new Date(timestampToMilliseconds(event.start_time)).toLocaleDateString('en-GB') : null}</Text>
                    <Text style={styles.small_text}>{event ? new Date(timestampToMilliseconds(event.start_time)).getHours() : null} : {event ? new Date(timestampToMilliseconds(event.start_time)).getMinutes().toString().padStart(2, "0"):null}</Text>
                    {event?.place_id && (
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3495eb', padding: 15, borderRadius: 20, margin: 10 }} onPress={redirectToMap}>
                            <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>{location == null ? "Voir sur la carte" : location.title} </Text>
                            <Image source={require('../../assets/images/icons/locate-outline.png')} style={{ width: 25, height: 25, tintColor: 'white' }} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    small_text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    big_text: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    description_container: {
        flex: 2,
        width: '100%',
        padding: 30,
        margin: 10,
    }
});

export default EventPage;
