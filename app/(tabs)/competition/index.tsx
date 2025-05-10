import React, { Component, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { atlanticupGetAllSports } from '../../../backend/atlanticupBackendFunctions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLoader from '@/components/ScreenLoader';

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

const color1 = '#1A3149'
const color2 = '#67A3C6'
const color3 = 'white'

// SportItem component with color gradient based on index
const SportItem: React.FC<{ item: Sport; index: number; totalItems: number; props: Props; onImageLoaded : any}> = ({ item, index, totalItems, props, onImageLoaded}) => {
    const color = index % 2 === 0
        ? color1
        : color2;

    const oppositeColor = index % 2 === 0 
        ? color2
        : color1;

    const handleImageLoad = () => {
        onImageLoaded();
    }

    return (
        <TouchableOpacity style={{ flexDirection : (index % 2 === 0 ? 'row' : 'row-reverse') }} onPress={() => router.navigate(`/competition/sportDetail/${item.id}?name=${item.title}`)}>
            <View style={[styles.sportItemContainer, { flexDirection: (index % 2 === 0 ? 'row' : 'row-reverse'), backgroundColor: color }]}>
                <Image source={{ uri: item.image }} style={[styles.image, { tintColor: oppositeColor }, ( index % 2 === 0 ? { right : 20} : { left: 20 })]} onLoadEnd={handleImageLoad}/>
                <Text style={[styles.text, { color : color3 }]} >{item.title.toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );
};

const CompetitionScreen: React.FC<Props> = (props) => {
    const [sports, setSports] = useState<Sport[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const [allImagesLoaded, setAllImagesLoaded] = useState(false);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchSports();
    }, []);

    useEffect(() => {
        if (imagesLoaded === sports.length && sports.length > 0) {
            console.log('all images loaded now');
            setAllImagesLoaded(true);
        }
    }, [imagesLoaded]);

    const fetchSports = async () => {
        setRefreshing(true);
        setImagesLoaded(0);
        setAllImagesLoaded(false);
        const sports = await atlanticupGetAllSports();
        setSports(sports);
        setRefreshing(false);
    };

    const handleImageLoad = () => {
        console.log('new image loaded');
        setImagesLoaded(prev => prev + 1);
    }

    return (
        <SafeAreaView style={[styles.container, {paddingBottom: insets.bottom}]}>
            {refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{height:200, width:200}}>
                        <ScreenLoader />
                    </View>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <FlatList
                        data={sports}
                        renderItem={({ item, index }) => (
                            <SportItem item={item} index={index} totalItems={sports.length} props={props} onImageLoaded={handleImageLoad}/>
                        )}
                        keyExtractor={item => item.id}
                        refreshing={refreshing}
                        onRefresh={fetchSports}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <TouchableOpacity onPress={() => router.navigate('/competition/generalRanking')}>
                                <View style={styles.last_container}>
                                    <Image source={require('../../../assets/images/logo-atlanticup-no-background.png')} style={styles.last_image} defaultSource={require('../../../assets/images/ripple-loading.svg')}/>
                                    <Text style={styles.last_text}>Classement général</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

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
        borderRadius: 30,
        padding:15,
        width: '70%',
        height: 120,
        alignItems: 'center',
    },
    image: {
        position:'absolute',
        height: '120%',
        aspectRatio: 1,
        opacity: 0.20,
        overflow: 'hidden',
    },
    last_image: {
        width: width / 2 - 20 - 50,
        height: width / 2 - 20 - 50,
    },
    text: {
        fontSize: 26,
        fontWeight: 'bold',
        margin:15,
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
