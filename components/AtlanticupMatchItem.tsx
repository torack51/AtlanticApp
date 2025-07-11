import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, Easing, Pressable} from 'react-native';
import { getSportFromId } from '@/backend/firestore/sportsService';
import LinearGradient from 'react-native-linear-gradient';
import { Link, useRouter} from 'expo-router';
import ScreenLoader from './ScreenLoader';
import ContextMenu from 'react-native-context-menu-view';
const width = Dimensions.get('window').width;

interface Match {
    id: string;
    kind: string;
    sport_id: string;
    start_time: string;
    status: string;
    teams: Array<{ id: string; delegation_id: string; description: string }>;
    team1_id: string;
    team2_id: string;
    title: string;
    description: string;
    activity_id: string;
}

interface Delegation {
    id : string;
    color: string;
    image: string;
    title: string;
}

interface Team {
    id: string;
    delegation: Delegation;
    description: string;
}

interface User {
    id: string;
}

interface Props {
    match: Match;
}

const Type1Match =  ({ match, router, team1, team2, delegation1, delegation2, dayOfWeek, start_time, sport_image}: { match: Match, router: any, team1: Team, team2: Team, delegation1: Delegation, delegation2: Delegation, dayOfWeek: string, start_time: Date, sport_image: any }) => {
    return (
        <View style={styles.main_container}>
            <ContextMenu
                actions={[{ title: "Créer un rappel" }, { title: "Title 2" }]}
                borderRadius={35}
                onPress={(e) => {
                console.warn(
                    `Pressed ${e.nativeEvent.name} at index ${e.nativeEvent.index}`
                );
                }}
            >
                <Pressable onPress={() => router.push(`/matches/${match.id}`)} onLongPress={() => null}>
                        <View style={styles.touchable_container}>
                            <View style={{ height:'100%', width:'65%', flexDirection:'column', padding: 10, justifyContent:'space-between', alignItems:'center'}}>
                                <View style={{ height:'50%', width:'100%', justifyContent:'flex-start', flexDirection:'row',alignItems:'center'}}>
                                    <Image source={{ uri: delegation1.image }} style={{ width:40, height:40, marginRight:5}}/>
                                    <Text style={styles.text}>{delegation1.title} {team1.description}</Text>
                                </View>

                                <View style={{ height:'50%', width:'100%', justifyContent:'flex-start', flexDirection:'row', alignItems:'center'}}>
                                    <Image source={{ uri: delegation2.image }} style={{ width: 40, height: 40, marginRight:5 }}/>
                                    <Text style={styles.text}>{delegation2.title} {team2.description}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0)', 'black', 'rgba(0, 0, 0, 0)']}
                                style={styles.gradientBorder}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />                          

                            <View style={{ height:'100%', width:'35%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingRight: 20, paddingLeft: 10}}>
                                <View style={{ justifyContent:'center', alignItems:'center' }}>
                                    <Text style={styles.small_text}>{dayOfWeek}</Text>
                                    <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                                </View>
                                <View style={{ }}>
                                    <Image source={{ uri: sport_image || '' }} style={{ width: 50, height: 50, tintColor: 'black' }}/>
                                </View>
                            </View>
                        </View>
                </Pressable>
            </ContextMenu>
            </View>
    );
}
const Type2Match =  ({ match, router, team1, team2, delegation1, delegation2, dayOfWeek, start_time, sport_image}: { match: Match, router: any, team1: Team, team2: Team, delegation1: Delegation, delegation2: Delegation, dayOfWeek: string, start_time: Date, sport_image: any }) => {
    return (
        <View style={styles.main_container}>
            <ContextMenu
                actions={[{ title: "Créer un rappel" }, { title: "Title 2" }]}
                borderRadius={35}
                onPress={(e) => {
                console.warn(
                    `Pressed ${e.nativeEvent.name} at index ${e.nativeEvent.index}`
                );
                }}
            >
                <Pressable onPress={() => router.push(`/matches/${match.id}`)} onLongPress={() => null}>
                        <View style={styles.touchable_container}>
                            <View style={{ height:'100%', width:'65%', flexDirection:'column', padding: 10, justifyContent:'space-between', alignItems:'center'}}>
                                <View style={{ height:'50%', width:'100%', justifyContent:'flex-start', flexDirection:'row',alignItems:'center'}}>
                                    <Image source={{ uri: delegation1.image }} style={{ width:40, height:40, marginRight:5}}/>
                                    <Text style={styles.text}>{delegation1.title} {team1.description}</Text>
                                </View>

                                <View style={{ height:'50%', width:'100%', justifyContent:'flex-start', flexDirection:'row', alignItems:'center'}}>
                                    <Image source={{ uri: delegation2.image }} style={{ width: 40, height: 40, marginRight:5 }}/>
                                    <Text style={styles.text}>{delegation2.title} {team2.description}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0)', 'black', 'rgba(0, 0, 0, 0)']}
                                style={styles.gradientBorder}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />                          

                            <View style={{ height:'100%', width:'35%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingRight: 20, paddingLeft: 10}}>
                                <View style={{ justifyContent:'center', alignItems:'center' }}>
                                    <Text style={styles.small_text}>{dayOfWeek}</Text>
                                    <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                                </View>
                                <View style={{ }}>
                                    <Image source={{ uri: sport_image || '' }} style={{ width: 50, height: 50, tintColor: 'black' }}/>
                                </View>
                            </View>
                        </View>
                </Pressable>
            </ContextMenu>
            </View>
    );
}
const Type3Match =  ({ match, router, dayOfWeek, start_time, sport_image}: { match: Match, router: any, dayOfWeek: string, start_time: Date, sport_image: any }) => {
    return (
        <View style={styles.main_container}>
            <ContextMenu
                actions={[{ title: "Créer un rappel" }, { title: "Title 2" }]}
                borderRadius={35}
                onPress={(e) => {
                console.warn(
                    `Pressed ${e.nativeEvent.name} at index ${e.nativeEvent.index}`
                );
                }}
            >
                <Pressable onPress={() => router.push(`/matches/${match.id}`)} onLongPress={() => null}>
                        <View style={styles.touchable_container}>
                            <View style={{ height:'100%', width:'65%', flexDirection:'column', padding: 10, justifyContent:'space-between', alignItems:'center'}}>

                                <View style={{ height:'100%', width:'100%', justifyContent:'center', alignItems:'center'}}>
                                    <Text style={styles.big_text}>{match.title}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0)', 'black', 'rgba(0, 0, 0, 0)']}
                                style={styles.gradientBorder}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />                          

                            <View style={{ height:'100%', width:'35%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingRight: 20, paddingLeft: 10}}>
                                <View style={{ justifyContent:'center', alignItems:'center' }}>
                                    <Text style={styles.small_text}>{dayOfWeek}</Text>
                                    <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                                </View>
                                <View style={{ }}>
                                    <Image source={{ uri: sport_image || '' }} style={{ width: 50, height: 50, tintColor: 'black' }}/>
                                </View>
                            </View>
                        </View>
                </Pressable>
            </ContextMenu>
            </View>
    );
}

const AtlanticupMatchItem: React.FC<Props> = ({ match }) => {
    if (!match) return null;

    const [image, setImage] = useState<string | null>(null);
    const [loadedImagesCount, setLoadedImagesCount] = useState(0);
    const [allImagesLoaded, setAllImagesLoaded] = useState(false);
    const handleImageLoad = () => {
        setLoadedImagesCount(prev => prev+1);
    }
    const animatedValue1 = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useEffect(() => {
        fetchSportImage(match.sport_id);
    }, [match.sport_id]);


    const fetchSportImage = (sport_id: string) => {
        if (!image){
            getSportFromId(sport_id).then((sport) => {
-                setImage(sport.image);
            });
        } 
    };

    const getDayOfWeek = (date: Date): string => {
        const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
        return days[date.getDay()];
    };

    const getMatchType = (match: Match): 'type1' | 'type2' | 'type3' => {
        switch (match.sport_id) {
            case 'basketball':
            case 'football':
            case 'handball':
            case 'rugby':
            case 'ultimate':
                return 'type1';
            case 'volleyball':
            case 'badminton':
            case 'table_tennis':
                return 'type2';
            case 'relay':
            case 'climbing':
                return 'type3';
            default:
                throw new Error(`Unknown match type: ${match.sport_id}`);
        }
    };

    const renderMatch = (match: Match, scaleInterpolation1: Animated.AnimatedInterpolation<number>, opacityInterpolation1: Animated.AnimatedInterpolation<number>, borderWidthInterpolation1: Animated.AnimatedInterpolation<number>) => {
        const matchType = getMatchType(match);

        if (matchType === 'type3') {
            const start_time = new Date(match.start_time);
            return <Type3Match match={match} router={router} dayOfWeek={getDayOfWeek(start_time)} start_time={start_time} sport_image={image} />
        }

        else if (matchType === 'type2') {
            const start_time = new Date(match.start_time);
            const team1 = match.teams.find((team) => team.id === match.team1_id);
            const team2 = match.teams.find((team) => team.id === match.team2_id);
            if (!team1 || !team2) return null;
            return <Type2Match match={match} router={router} team1={team1} team2={team2} dayOfWeek={getDayOfWeek(start_time)} start_time={start_time} sport_image={image} />;
        }

        else if (matchType === 'type1') {
            const start_time = new Date(match.start_time);
            const team1 = match.teams.find((team) => team.id === match.team1_id);
            const team2 = match.teams.find((team) => team.id === match.team2_id);
            if (!team1 || !team2) return null;
            return <Type1Match match={match} router={router} team1={team1} team2={team2} dayOfWeek={getDayOfWeek(start_time)} start_time={start_time} sport_image={image} />;
        }

        else
            throw new Error(`Unknown match type: ${matchType}, ${match}`);
        return (
            <View style={styles.main_container}>
            <ContextMenu
                actions={[{ title: "Créer un rappel" }, { title: "Title 2" }]}
                borderRadius={35}
                onPress={(e) => {
                console.warn(
                    `Pressed ${e.nativeEvent.name} at index ${e.nativeEvent.index}`
                );
                }}
            >
                <Pressable onPress={() => router.push(`/matches/${match.id}`)}>
                        <View style={styles.touchable_container}>
                            <View style={{ height:'100%', width:'65%', flexDirection:'column', padding: 10, justifyContent:'space-between', alignItems:'center'}}>
                                <View style={{ height:'50%', width:'100%', justifyContent:'flex-start', flexDirection:'row',alignItems:'center'}}>
                                    <Image source={{ uri: team1.delegation.image }} style={{ width:40, height:40, marginRight:5}}/>
                                    <Text style={styles.text}>{team1.delegation.title} {team1.description}</Text>
                                </View>

                                <View style={{ height:'50%', width:'100%', justifyContent:'flex-start', flexDirection:'row', alignItems:'center'}}>
                                    <Image source={{ uri: team2.delegation.image }} style={{ width: 40, height: 40, marginRight:5 }}/>
                                    <Text style={styles.text}>{team2.delegation.title} {team2.description}</Text>
                                </View>
                            </View>

                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0)', 'black', 'rgba(0, 0, 0, 0)']}
                                style={styles.gradientBorder}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            />                          

                            <View style={{ height:'100%', width:'35%', flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingRight: 20, paddingLeft: 10}}>
                                <View style={{ justifyContent:'center', alignItems:'center' }}>
                                    <Text style={styles.small_text}>{getDayOfWeek(start_time)}</Text>
                                    <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                                </View>
                                <View style={{ }}>
                                    <Image source={{ uri: image || '' }} style={{ width: 50, height: 50, tintColor: 'black' }}/>
                                </View>
                            </View>
                        </View>
                </Pressable>
            </ContextMenu>
            </View>
        );
        return (
            <View style={styles.main_container}>
            <ContextMenu
                actions={[{ title: "Créer un rappel" }, { title: "Title 2" }]}
                borderRadius={35}
                onPress={(e) => {
                console.warn(
                    `Pressed ${e.nativeEvent.name} at index ${e.nativeEvent.index}`
                );
                }}
            >
                <Pressable onPress={() => router.push(`/matches/${match.id}`)}>
                        <View style={styles.touchable_container}>
                            <LinearGradient colors={[team1.delegation.color, team2.delegation.color]} style={styles.touchable_container} start={{ x: 0.4, y: 0 }} end={{ x: 0.6, y: 1 }}>
                                <View style={{ position: 'absolute', top: 0 }}>
                                    <Image source={{ uri: image || '' }} style={{ width: 50, height: 50, tintColor: 'black' }}/>
                                </View>
                                <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                    <View style={{ opacity: 0.35, transform: [{ rotate: '-30deg' }] }}>
                                        <Image source={{ uri: team1.delegation.image }} style={{ width: 150, height: 150 }}/>
                                    </View>
                                    <View style={{ opacity: 0.35, transform: [{ rotate: '-30deg' }] }}>
                                        <Image source={{ uri: team2.delegation.image }} style={{ width: 150, height: 150 }}/>
                                    </View>
                                </View>

                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.text}>{team1.delegation.title} {team1.description}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={styles.text}>{team2.delegation.title} {team2.description}</Text>
                                </View>

                                <View style={{ position: 'absolute', bottom: 5 }}>
                                    <Text style={styles.small_text}>{getDayOfWeek(start_time)}</Text>
                                    <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                                </View>
                            </LinearGradient>
                        </View>
                </Pressable>
            </ContextMenu>
            </View>
        );
    };

    const scaleInterpolation1 = animatedValue1.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.025, 1.05],
    });

    const opacityInterpolation1 = animatedValue1.interpolate({
        inputRange: [0, 0.5, 0.8, 1],
        outputRange: [0, 0.7, 0.2, 0],
    });

    const borderWidthInterpolation1 = animatedValue1.interpolate({
        inputRange: [0, 0.2, 0.5, 0.8, 1],
        outputRange: [0, 3, 6, 3, 0],
    });

    if (match){
        return renderMatch(match, scaleInterpolation1, opacityInterpolation1, borderWidthInterpolation1);
    }
    else{
        return null;
    }
};

const styles = StyleSheet.create({
    main_container: {
        width: '100%',
        height:'100%',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 30,
    },
    touchable_container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'row',
        borderRadius: 30,
    },
    big_text: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    small_text: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    gradientBorder: {
        width: 1,
        height: '80%',
      },
});

export default AtlanticupMatchItem;
