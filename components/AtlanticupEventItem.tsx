import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, Easing, Pressable} from 'react-native';
import { atlanticupGetSportFromId } from '../backend/atlanticupBackendFunctions';
import LinearGradient from 'react-native-linear-gradient';
import { Link, router} from 'expo-router';
import ContextMenu from 'react-native-context-menu-view';

const width = Dimensions.get('window').width;

interface Event {
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
    event: Event;
}

interface State {
    image: string | null;
    isSubscribed?: boolean;
    isOrganizer?: boolean;
}

class AtlanticupEventItem extends React.Component<Props, State> {
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

        if (this.props.event.kind === "match") {
            this.fetchSportImage(this.props.event.sport_id);
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

    getDayOfWeek = (date: Date): string => {
        const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
        return days[date.getDay()];
    };

    renderEvent(event: Event, scaleInterpolation1: Animated.AnimatedInterpolation<number>, opacityInterpolation1: Animated.AnimatedInterpolation<number>, borderWidthInterpolation1: Animated.AnimatedInterpolation<number>) {
        const start_time = new Date(event.start_time);
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
                <Pressable onPress={() => router.push(`/events/${event.id}`)} onLongPress={null}>
                    <View style={styles.main_container}>
                        <LinearGradient colors={['rgba(255,219,35,0.7)', 'rgba(27,73,102,0.7)']} style={[styles.touchable_container, { borderRadius: 5 }]} start={{ x: 0.4, y: 0 }} end={{ x: 0.6, y: 1 }}>
                            <View style={[styles.touchable_container, { flexDirection: 'column'}]}>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={styles.text}>{event.title}</Text>
                                </View>
                                <View style={{ flex: 1, padding: 5, width: '100%' }}>
                                    <Text style={{ alignSelf: 'flex-start' }}>{event.description.replace(/\\n/g, "\n")}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.small_text}>{this.getDayOfWeek(start_time)}</Text>
                                    <Text style={styles.small_text}>{start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </Pressable>
            </ContextMenu>
        );
    }

    fetchSportImage(sport_id: string) {
        atlanticupGetSportFromId(sport_id).then((sport) => {
            this.setState({ image: sport.image });
        });
    }


    render() {
        const { event } = this.props;
        const start_time = new Date(event.start_time);

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
        
        return event ? this.renderEvent(event, scaleInterpolation1, opacityInterpolation1, borderWidthInterpolation1) : null;
    }
}

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
});

export default AtlanticupEventItem;
