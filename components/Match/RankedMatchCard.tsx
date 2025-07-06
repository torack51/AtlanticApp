import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getTeamFromId } from '@/backend/firestore/teamService';
import { getDelegationFromId } from '@/backend/firestore/delegationService';
import { getPlaceFromId } from '@/backend/firestore/placeService';

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

interface Delegation {
    id : string;
    color: string;
    image: string;
    title: string;
}

interface Team {
    id: string;
    category: string;
    delegation_id: string;
    sport : string;
    description: string;
}

interface MatchCardProps {
    match: Match;
}

const RankedMatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const [teams, setTeams] = React.useState<Team | null>(null);
    const [delegations, setDelegations] = React.useState<Delegation | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [activeFetches, setActiveFetches] = React.useState<number>(0);
    const [location, setLocation] = React.useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        };
        fetchData();
    }, [match.team1_id, match.team2_id]);

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
        setLoading(activeFetches > 0);
    }, [activeFetches]);

    const getDayOfWeek = (date: Date): string => {
        const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
        return days[(new Date(date)).getDay()];
    };

    const translateStatus = (status: string): string => {
        switch (status) {
            case 'live':
                return 'En cours';
            case 'completed':
                return 'Terminé';
            case 'upcoming':
                return 'À venir';
            case 'cancelled':
                return 'Annulé';
            case 'postponed':
                return 'Reporté';
            default:
                return status;
        }
    };

    if (!loading){
        return (
            <TouchableOpacity style={styles.container} onPress={() => router.push(`/matches/head_to_head/${match.id}`)} onLongPress={() => null}>
                <View style={styles.header}>
                    <Text style={styles.dateTime}>{getDayOfWeek(match.start_time)} {(new Date(match.start_time)).getHours()}:{(new Date(match.start_time)).getMinutes().toString().padStart(2, "0")}</Text>
                    <Text style={[styles.status, 
                        match.status === 'live' ? styles.liveStatus : 
                        match.status === 'completed' ? styles.completedStatus : 
                        styles.upcomingStatus]}>
                        {translateStatus(match.status).toUpperCase()}
                    </Text>
                </View>
                
                {/*<View style={styles.teamsContainer}>
                    <View style={styles.teamInfo}>
                        <Image source={{ uri: delegation1?.image }} style={styles.teamLogo} />
                        <Text style={styles.teamName}>{delegation1?.title} {team1?.description}</Text>
                    </View>
                    
                    <View style={styles.scoreContainer}>
                        {match.status !== 'upcoming' && (
                            <>
                                <Text style={styles.score}>{match.team1_score ?? 0}</Text>
                                <Text style={styles.scoreSeparator}>-</Text>
                                <Text style={styles.score}>{match.team2_score ?? 0}</Text>
                            </>
                        )}
                        {match.status === 'upcoming' && (
                            <Text style={styles.vsText}>VS</Text>
                        )}
                    </View>
                    
                    <View style={styles.teamInfo}>
                        <Image source={{ uri: delegation2?.image }} style={styles.teamLogo} />
                        <Text style={styles.teamName}>{delegation2?.title} {team2?.description}</Text>
                    </View>
                </View> */}
                
                <Text style={styles.venue}>{location}</Text>
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.dateTime}>{match.start_time}</Text>
                <Text style={[styles.status, styles.upcomingStatus]}>
                    LOADING...
                </Text>
            </View>
            <View style={styles.teamsContainer}>
                <View style={styles.teamInfo}>
                    <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.teamLogo} />
                    <Text style={styles.teamName}>Loading...</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={styles.teamInfo}>
                    <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.teamLogo} />
                    <Text style={styles.teamName}>Loading...</Text>
                </View>
            </View>
            <Text style={styles.venue}>Loading...</Text>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
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
    teamsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    teamInfo: {
        flex: 2,
        alignItems: 'center',
    },
    teamLogo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    teamName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scoreContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 4,
    },
    scoreSeparator: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#666',
    },
    vsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
    },
    venue: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default RankedMatchCard;