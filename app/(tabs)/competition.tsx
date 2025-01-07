import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { atlanticupGetAllSports } from '../../backend/atlanticupBackendFunctions';
import { SafeAreaView } from 'react-native-safe-area-context';

const width = Dimensions.get('window').width;

type Sport = {
    id: string;
    title: string;
    image: string;
};

type Props = {
    navigation: {
        navigate: (screen: string, params?: object) => void;
    };
};

type State = {
    sports: Sport[];
    refreshing: boolean;
};

// Function to interpolate colors
const interpolateColor = (color1: number[], color2: number[], factor: number): number[] => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

// Convert RGB color to hexadecimal format
const rgbToHex = (rgb: number[]): string => {
    return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

// Colors in [R, G, B] format
const endColor = [29, 73, 102]; // Light blue
const startColor = [255, 219, 35]; // Tomato red

// SportItem component with color gradient based on index
const SportItem: React.FC<{ item: Sport; index: number; totalItems: number; props: Props }> = ({ item, index, totalItems, props }) => {
    const factor = index / (totalItems - 1); // Interpolation factor based on index
    const color = rgbToHex(interpolateColor(startColor, endColor, factor)); // Interpolated color

    return (
        <TouchableOpacity onPress={() => props.navigation.navigate('SportDetailScreen', { sport: item })}>
            <View style={[styles.sportItemContainer]}>
                <Image source={{ uri: item.image }} style={[styles.image, { tintColor: color }]} />
                <Text style={[styles.text, { color }]}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );
};

class CompetitionScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            sports: [],
            refreshing: false,
        };
    }

    componentDidMount() {
        this.fetchSports();
    }

    fetchSports = async () => {
        this.setState({ refreshing: true });
        const sports = await atlanticupGetAllSports();
        this.setState({ sports, refreshing: false });
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.topBar}>
                    <Text style={styles.topText}>Choisissez un sport</Text>
                </View>
                {this.state.refreshing ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <View style={styles.listContainer}>
                        <FlatList
                            data={this.state.sports}
                            numColumns={2}
                            renderItem={({ item, index }) => (
                                <SportItem item={item} index={index} totalItems={this.state.sports.length} props={this.props} />
                            )}
                            keyExtractor={item => item.id}
                            refreshing={this.state.refreshing}
                            onRefresh={this.fetchSports}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('GeneralRanking')}>
                                    <View style={styles.last_container}>
                                        <Image source={require('../../assets/images/icons/logo_ac.png')} style={styles.last_image} />
                                        <Text style={styles.last_text}>Classement des écoles</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                        />
                    </View>
                )}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        alignSelf: 'center',
        marginTop: 20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    listContainer: {
        alignItems: 'center',
        flex: 1,
    },
    sportItemContainer: {
        margin: 5,
        padding: 10,
        borderRadius: 30,
        width: width / 2 - 20,
        height: width / 2 - 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width / 2 - 20 - 50,
        height: width / 2 - 20 - 50,
        tintColor: 'black',
    },
    last_image: {
        width: width / 2 - 20 - 50,
        height: width / 2 - 20 - 50,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    last_text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    last_container: {
        margin: 5,
        padding: 10,
        borderRadius: 30,
        width: width - 20,
        height: width / 2 - 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CompetitionScreen;
