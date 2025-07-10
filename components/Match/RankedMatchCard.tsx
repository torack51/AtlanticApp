import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getTeamFromId } from '@/backend/firestore/teamService';
import { getDelegationFromId } from '@/backend/firestore/delegationService';
import { getPlaceFromId } from '@/backend/firestore/placeService';
import { getSportFromId } from '@/backend/firestore/sportsService';
import { translateStatus } from '@/backend/matchStatusTranslator';

interface Match {
    id: string;
    kind: string;
    sport_id: string;
    start_time: Date;
    status: string;
    title: string;
    description: string;
    place_id: string;
}

interface Sport {
    id: string;
    image: string;
    title: string;
}

interface MatchCardProps {
    match: Match;
}

const RankedMatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const [activeFetches, setActiveFetches] = React.useState<number>(0);
    const [sport, setSport] = React.useState<Sport | null>(null);
    const [location, setLocation] = React.useState<string | null>(null);

    useEffect(() => {
        const fetchPlace = async () => {
            if (match.place_id) {
                setActiveFetches(prev => prev + 1);
                try {
                    const placeData = await getPlaceFromId(match.place_id);
                    setLocation(placeData.title);
                } catch (error) {
                    console.error('Error fetching place data:', error);
                } finally {
                    setActiveFetches(prev => prev - 1);
                }
            }
        };
        fetchPlace();
    }, [match.place_id]);

    useEffect(() => {
        const fetchSport = async () => {
            if (match.sport_id) {
                setActiveFetches(prev => prev + 1);
                try {
                    const sportData = await getSportFromId(match.sport_id);
                    setSport(sportData);
                } catch (error) {
                    console.error('Error fetching sport data:', error);
                } finally {
                    setActiveFetches(prev => prev - 1);
                }
            }
        };
        fetchSport();
    }, [match.sport_id]);

    const getDayOfWeek = (date: Date): string => {
        const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
        return days[(new Date(date)).getDay()];
    };

    if (activeFetches == 0) {
        return (
            <TouchableOpacity style={styles.container} onPress={() => router.push(`/matches/head_to_head/${match.id}`)} onLongPress={() => null}>
                <View style={styles.header}>
                    <Text style={styles.dateTime}>{getDayOfWeek(match.start_time)} {(new Date(match.start_time)).getHours()}:{(new Date(match.start_time)).getMinutes().toString().padStart(2, "0")}</Text>
                    <Image source={{ uri: sport?.image }} style={styles.image} />
                    <Text style={[styles.status, 
                        match.status === 'live' ? styles.liveStatus : 
                        match.status === 'completed' ? styles.completedStatus : 
                        styles.upcomingStatus]}>
                        {translateStatus(match.status).toUpperCase()}
                    </Text>
                </View>
                        
                <View style={styles.content_container}>
                    <Text style={styles.title} numberOfLines={1}>{sport?.title} - {match.title}</Text>
                    <Text style={styles.description}>{match.description.replace(/\\n/g, "\n")}</Text>
                </View>
                
                <Text style={styles.venue}>{location}</Text>
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.dateTime}>Chargement...</Text>
                <Text style={[styles.status, styles.upcomingStatus]}>
                    Chargement...
                </Text>
            </View>
            <Text style={styles.venue}>Chargement...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 220,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    image: {
        width: 40,
        height: 40,
        tintColor: '#000',
    },
    content_container: {
        flex:1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#444',
        marginBottom: 8,
    },
    dateTime: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        height: 24,
    },
    liveStatus: {
        backgroundColor: '#FF4D4F',
        color: '#FFFFFF',
    },
    completedStatus: {
        backgroundColor: '#52C41A',
        color: '#FFFFFF',
    },
    upcomingStatus: {
        backgroundColor: '#1890FF',
        color: '#FFFFFF',
    },
    venue: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default RankedMatchCard;