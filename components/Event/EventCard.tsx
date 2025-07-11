import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MatchCard from '@/components/Match/MatchCard';
import ContextMenu from 'react-native-context-menu-view';
import LinearGradient from 'react-native-linear-gradient';
import { router } from 'expo-router';

interface Event {
    id: string;
    kind: "event" | "match";
    title: string;
    description: string;
    start_time: Date;
    status: "live" | "completed" | "uncoming" | "cancelled" | "postponed";
    location?: string;
}

interface EventCardProps {
    event: Event;
    onPress?: (event: Event) => void;
}

const getDayOfWeek = (date: Date): string => {
    const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    return days[(new Date(date)).getDay()];
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    
    if (event.kind == "match") {
        return <MatchCard match={event}/>;
    }
    return (
        <ContextMenu
            actions={[{ title: "Créer un rappel" }, { title: "Title 2" }]}
            borderRadius={35}
            onPress={(e) => {
            console.warn(
                `Pressed ${e.nativeEvent.name} at index ${e.nativeEvent.index}`
            );
            }}
        >
            <TouchableOpacity onPress={() => router.push(`/events/${event.id}`)}>
                <View style={styles.card}>
                    <LinearGradient colors={['rgba(255,219,35,0.7)', 'rgba(27,73,102,0.7)']} style={{ borderRadius: 5 }} start={{ x: 0.4, y: 0 }} end={{ x: 0.6, y: 1 }}>
                        <View style={[styles.container, { flexDirection: 'column'}]}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={styles.title}>{event.title}</Text>
                            </View>
                            <View style={{ flex: 1, padding: 5, width: '100%' }}>
                                <Text style={{ alignSelf: 'flex-start' }}>{event.description.replace(/\\n/g, "\n")}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.description}>{getDayOfWeek(event.start_time)}</Text>
                                <Text style={styles.description}>{(new Date(event.start_time)).getHours()}:{(new Date(event.start_time)).getMinutes().toString().padStart(2, "0")}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </ContextMenu>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    container: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#444',
    },
});

export default EventCard;