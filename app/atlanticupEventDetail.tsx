import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { atlanticupGetPlaceFromId } from '../backend/atlanticupBackendFunctions';
import LinearGradient from 'react-native-linear-gradient';
import { useSearchParams } from 'expo-router/build/hooks';
import { useRouter } from 'expo-router';

interface Event {
    title: string;
    description: string;
    start_time: string;
    place_id: string | null;
}

interface Location {
    title: string;
}

interface Props {
    route: {
        params: {
            event: Event;
            location: Location;
        };
    };
    navigation: {
        navigate: (screen: string, params?: object) => void;
    };
}

interface State {
    event: Event | null;
    location: Location | null;
}

class AtlanticupEventDetail extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            event: null,
            location: null,
        };
    }

    

    componentDidMount() {
        this.fetchLocation();
    }

    fetchLocation = async () => {
        const location = this.state.event.place_id ? await atlanticupGetPlaceFromId(this.state.event.place_id) : null;
        this.setState({ location: location });
    }

    redirectToMap = () => {
        this.props.navigation.navigate('Carte', { redirect_to_place_id: this.state.event.place_id });
    }

    render() {
        /*const event = this.state.event;
        const start_time = new Date(event.start_time);*/

        const {router} = this.props;
        const event_id = router.getParam('event_id');
        console.log('event_id', event_id); 

        return (
            <View style={{ flex: 1 }}>
                <LinearGradient colors={['rgba(27,73,102,0.7)', 'rgba(255,219,35,0.9)']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.header}>
                        <Text style={styles.big_text}>{/*event.title*/}</Text>
                    </View>
                    <View style={styles.description_container}>
                        <Text style={[styles.small_text, { fontWeight: '300' }]}>{/*event.description.replace(/\\n/g, "\n")*/}</Text>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.small_text}>{/*start_time.toLocaleDateString('en-GB')*/}</Text>
                        <Text style={styles.small_text}>{/*start_time.getHours()}:{start_time.getMinutes().toString().padStart(2, "0")*/}</Text>
                        {/*
                            (event.place_id != "" && event.place_id != null) ?
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#3495eb', padding: 15, borderRadius: 20, margin: 10 }} onPress={this.redirectToMap}>
                                        <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 22 }}>{this.state.location == null ? "Voir sur la carte" : this.state.location.title} </Text>
                                        <Image source={require('../assets/images/icons/locate-outline.png')} style={{ width: 25, height: 25, tintColor: 'white' }}/>
                                    </TouchableOpacity>
                                :
                                <></>
                        */}
                    </View>
                </LinearGradient>
            </View>
        );
    }
}

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

export default AtlanticupEventDetail;