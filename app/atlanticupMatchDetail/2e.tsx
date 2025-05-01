import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { atlanticupGetPlaceFromId, atlanticupGetEventFromId} from '../../backend/atlanticupBackendFunctions';
import LinearGradient from 'react-native-linear-gradient';
import { useRouter, useLocalSearchParams} from 'expo-router';
import AtlanticupMatchDetailType1 from '@/components/MatchDetail/AtlanticupMatchDetailType1';
import AtlanticupMatchDetailType2 from '@/components/MatchDetail/AtlanticupMatchDetailType2';
import AtlanticupMatchDetailType3 from '@/components/MatchDetail/AtlanticupMatchDetailType3';

interface Match {
    title: string;
    description: string;
    start_time: string;
    place_id: string | null;
    sport_id : string;
}

interface Location {
    title: string;
}

const AtlanticupMatchDetail: React.FC = () => {
    const [match, setMatch] = useState<Match | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const router = useRouter();
    const {match_id} = useLocalSearchParams();

    useEffect(() => {
        fetchMatch();
    }, [match_id]);

    useEffect(() => {
        fetchLocation();
    }, [match]);

    const fetchLocation = async () => {
        if (match?.place_id) {
            const location = await atlanticupGetPlaceFromId(match.place_id);
            setLocation(location);
        }
    };

    const fetchMatch = async () => {
        if (typeof match_id === 'string') {
            const match = await atlanticupGetEventFromId(match_id);
            setMatch(match);
        }
        else{
            console.warn('match_id is not a string');
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

    switch (match?.sport_id){
        case 'basketball_f':
        case 'basketball_m':
        case 'football_f':
        case 'football_m':
        case 'handball':
        case 'rugby_m':
        case 'ultimate':
            return (<AtlanticupMatchDetailType1 match={match}/>);
        case 'badminton':
        case 'table_tennis':
        case 'volleyball_f':
        case 'volleyball_m':
            return (<AtlanticupMatchDetailType2 match={match}/>)
        case 'running':
        case 'climbing_m':
        case 'climbing_f':
            return (<AtlanticupMatchDetailType3 match={match}/>);
        default:
            return (
                    <Text>Match not found</Text>
            );
    }

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['rgba(27,73,102,0.7)', 'rgba(255,219,35,0.9)']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.big_text}>{match?.title}</Text>
                </View>
                <View style={styles.description_container}>
                    <Text style={[styles.small_text, { fontWeight: '300' }]}>{match?.description.replace(/\\n/g, "\n")}</Text>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.small_text}>{match ? new Date(timestampToMilliseconds(match.start_time)).toLocaleDateString('en-GB') : null}</Text>
                    <Text style={styles.small_text}>{match ? new Date(timestampToMilliseconds(match.start_time)).getHours() : null} : {match ? new Date(timestampToMilliseconds(match.start_time)).getMinutes().toString().padStart(2, "0"):null}</Text>
                    {match?.place_id && (
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

export default AtlanticupMatchDetail;
