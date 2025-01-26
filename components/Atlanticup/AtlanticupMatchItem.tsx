import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { atlanticupGetSportFromId } from '../../backend/atlanticupBackendFunctions';
import LinearGradient from 'react-native-linear-gradient';
import { Link, router} from 'expo-router';

const width = Dimensions.get('window').width;

interface Match {
    id: string;
    kind: string;
    sport_id: string;
    start_time: string;
    status: string;
    teams: Array<{ id: string; delegation: { color: string; image: string; title: string }; description: string }>;
    team1_id: string;
    team2_id: string;
    title: string;
    description: string;
    activity_id: string;
}

interface User {
    id: string;
}

interface Props {
    match: Match;
    currentUser: { currentUser: User };
}

interface State {
    image: string | null;
    isSubscribed?: boolean;
    isOrganizer?: boolean;
}

class AtlanticupMatchItem extends React.Component<Props, State> {
    animatedValue1: Animated.Value;

    constructor(props: Props) {
        super(props);
        this.state = {
            image: null,
        };
        this.animatedValue1 = new Animated.Value(0);
    }

    componentDidMount() {
        this.startAnimation();

        /*
        getParticipationsFromUserId(this.props.currentUser.currentUser.id).then((participations) => {
            this.setState({ isSubscribed: participations.includes(this.props.event.id) });
        });
        getOrganizersFromActivityId(this.props.event.activity_id).then((organizers) => {
            this.setState({ isOrganizer: organizers.includes(this.props.currentUser.currentUser.id) });
        });*/

        if (this.props.match.kind === "match") {
            this.fetchSportImage(this.props.match.sport_id);
        }
    }

    startAnimation() {
        Animated.loop(
            Animated.parallel([
                Animated.timing(this.animatedValue1, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }

    renderMatch(match: Match, scaleInterpolation1: Animated.AnimatedInterpolation<number>, opacityInterpolation1: Animated.AnimatedInterpolation<number>, borderWidthInterpolation1: Animated.AnimatedInterpolation<number>) {
        const start_time = new Date(match.start_time);  
        const team1 = match.teams.find((team) => team.id === match.team1_id);
        const team2 = match.teams.find((team) => team.id === match.team2_id);
        if (!team1 || !team2) return null;
        return (
            <Link href={`/atlanticupMatchDetail/${match.id}`}>
            <View style={styles.main_container}>
                {match.status === "playing" && (
                    <Animated.View
                        style={[
                            styles.animated_rectangle,
                            { borderColor: 'red', transform: [{ scale: scaleInterpolation1 }], opacity: opacityInterpolation1, borderWidth: borderWidthInterpolation1 },
                        ]} 
                    />
                )}
                <TouchableOpacity style={styles.touchable_container}>
                    <LinearGradient colors={[team1.delegation.color, team2.delegation.color]} style={styles.touchable_container} start={{ x: 0.4, y: 0 }} end={{ x: 0.6, y: 1 }}>
                        <View style={{ position: 'absolute', top: 0 }}>
                            <Image source={{ uri: this.state.image || '' }} style={{ width: 50, height: 50, tintColor: 'black' }} />
                        </View>
                        <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                            <View style={{ opacity: 0.35, transform: [{ rotate: '-30deg' }] }}>
                                <Image source={{ uri: team1.delegation.image }} style={{ width: 150, height: 150 }} />
                            </View>
                            <View style={{ opacity: 0.35, transform: [{ rotate: '-30deg' }] }}>
                                <Image source={{ uri: team2.delegation.image }} style={{ width: 150, height: 150 }} />
                            </View>
                        </View>

                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.text}>{team1.delegation.title} {team1.description}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.text}>{team2.delegation.title} {team2.description}</Text>
                        </View>

                        <View style={{ position: 'absolute', bottom: 5 }}>
                            <Text style={styles.small_text}>{start_time.toLocaleDateString('en-GB')}</Text>
                            <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            </Link>
        );
    }

    fetchSportImage(sport_id: string) {
        atlanticupGetSportFromId(sport_id).then((sport) => {
            this.setState({ image: sport.image });
        });
    }

    render() {
        const { match } = this.props;
        const start_time = new Date(match.start_time);

        const scaleInterpolation1 = this.animatedValue1.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.025, 1.05],
        });

        const opacityInterpolation1 = this.animatedValue1.interpolate({
            inputRange: [0, 0.5, 0.8, 1],
            outputRange: [0, 0.7, 0.2, 0],
        });

        const borderWidthInterpolation1 = this.animatedValue1.interpolate({
            inputRange: [0, 0.2, 0.5, 0.8, 1],
            outputRange: [0, 3, 6, 3, 0],
        });

        return match ? this.renderMatch(match, scaleInterpolation1, opacityInterpolation1, borderWidthInterpolation1) : null;
    }
}

const styles = StyleSheet.create({
    main_container: {
        width: width * 0.9,
        margin: 10,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 30,
    },
    touchable_container: {
        width: width * 0.9,
        margin: 10,
        height: 120,
        borderColor: 'rgba(50,50,50,0.4)',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 30,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    small_text: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    animated_rectangle: {
        position: "absolute",
        width: width * 0.90 + 5,
        height: 120 + 5,
        borderRadius: 23,
    },
});

export default AtlanticupMatchItem;
