import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getTeamFromId } from '@/backend/firestore/teamService';
import { getDelegationFromId } from '@/backend/firestore/delegationService';
import { getPlaceFromId } from '@/backend/firestore/placeService';
import { translateStatus } from '@/backend/matchStatusTranslator';
import { getSportFromId } from '@/backend/firestore/sportsService';

interface Match {
    id: string;
    kind: string;
    sport_id: string;
    start_time: Date;
    status: string;
    team1_id: string;
    team2_id: string;
    team1_score?: number | number[];
    team2_score?: number | number[];
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

interface Sport {
    id: string;
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

const HeadToHeadMatchCard: React.FC<MatchCardProps> = ({ match }) => {
    const [team1, setTeam1] = React.useState<Team | null>(null);
    const [team2, setTeam2] = React.useState<Team | null>(null);
    const [delegation1, setDelegation1] = React.useState<Delegation | null>(null);
    const [delegation2, setDelegation2] = React.useState<Delegation | null>(null);
    const [activeFetches, setActiveFetches] = React.useState<number>(0);
    const [location, setLocation] = React.useState<string | null>(null);
    const [sport, setSport] = React.useState<Sport | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (match.team1_id) {
                setActiveFetches(prev => prev + 1);
                try {
                    const teamData = await getTeamFromId(match.team1_id);
                    setTeam1(teamData);
                    const delegationData = await getDelegationFromId(teamData.delegation_id);
                    setDelegation1(delegationData);
                } catch (error) {
                    console.error('Error fetching team1 data:', error);
                } finally {
                    setActiveFetches(prev => prev - 1);
                }
            }
            if (match.team2_id) {
                setActiveFetches(prev => prev + 1);
                try {
                    const teamData = await getTeamFromId(match.team2_id);
                    setTeam2(teamData);
                    const delegationData = await getDelegationFromId(teamData.delegation_id);
                    setDelegation2(delegationData);
                } catch (error) {
                    console.error('Error fetching team2 data:', error);
                } finally {
                    setActiveFetches(prev => prev - 1);
                }
            }
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

    console.log("score", typeof match.team1_score, match.team2_score);

    if (activeFetches == 0){
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
                
                <View style={styles.teamsContainer}>
                    <View style={styles.teamInfo}>
                        <Image source={{ uri: delegation1?.image }} style={styles.teamLogo} />
                        <Text style={styles.teamName} numberOfLines={1}>{delegation1?.title} {team1?.description}</Text>
                    </View>
                    
                    <View style={styles.scoreContainer}>
                        {match.status !== 'upcoming' && (
                            typeof match.team1_score === 'number' && typeof match.team2_score === 'number' ? (
                                <>
                                    <Text style={styles.score}>{match.team1_score}</Text>
                                    <Text style={styles.scoreSeparator}>-</Text>
                                    <Text style={styles.score}>{match.team2_score}</Text>
                                </>
                            ) : (
                            <>
                                <View style={styles.arrayScoreContainer}>
                                        {match?.team1_score?.map((score, index) => (
                                        <View key={index} style={{flexDirection: 'row'}}>
                                            <Text style={styles.score}>{match.team1_score[index]}</Text>
                                            <Text style={styles.scoreSeparator}>-</Text>
                                            <Text style={styles.score}>{match.team2_score[index]}</Text>
                                        </View>
                                        ))}
                                </View>
                            </>
                            )
                        )}
                        {match.status === 'upcoming' && (
                            <Text style={styles.vsText}>VS</Text>
                        )}
                    </View>
                    
                    <View style={styles.teamInfo}>
                        <Image source={{ uri: delegation2?.image }} style={styles.teamLogo} />
                        <Text style={styles.teamName} numberOfLines={1}>{delegation2?.title} {team2?.description}</Text>
                    </View>
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
            <View style={styles.teamsContainer}>
                <View style={styles.teamInfo}>
                    <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.teamLogo} />
                    <Text style={styles.teamName}>Chargement...</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={styles.teamInfo}>
                    <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.teamLogo} />
                    <Text style={styles.teamName}>Chargement...</Text>
                </View>
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
        marginBottom: 12,
    },
    image: {
        width: 40,
        height: 40,
        tintColor: '#000',
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
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 4,
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
    arrayScoreContainer : {
        flex: 1,
        flexDirection: 'column',
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
        fontSize: 22,
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

export default HeadToHeadMatchCard;