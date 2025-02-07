import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { getAuth } from 'firebase/auth';
import { atlanticupGetAllAnnouncements, atlanticupGetAllDelegations } from '../../../backend/atlanticupBackendFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const width = Dimensions.get('window').width;

interface Announcement {
    id: string;
    title: string;
    time_sent: string;
}

interface Team {
    id: string;
    title: string;
    image: string;
}

const ProfileScreen: React.FC = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const navigation = useNavigation();

    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchAnnouncements();
        getTeamFromStorage();
        fetchTeams();
    }, []);

    const getTeamFromStorage = async () => {
        const team = await AsyncStorage.getItem("atlanticup_team");
        if (team) {
            setSelectedTeam(team);
        }
    };

    const fetchTeams = async () => {
        const teams = await atlanticupGetAllDelegations();
        setTeams(teams);
    };

    const sortAnnouncementsByDate = (announcements: Announcement[]) => {
        return announcements.sort((a, b) => {
            return new Date(a.time_sent).getTime() - new Date(b.time_sent).getTime();
        });
    };

    const fetchAnnouncements = async () => {
        setLoadingAnnouncements(true);
        const announcements = await atlanticupGetAllAnnouncements();
        setAnnouncements(sortAnnouncementsByDate(announcements));
        setLoadingAnnouncements(false);
    };

    const signInButtonPressed = () => {
        /*const auth = getAuth(app);
        if (auth.currentUser) {
            auth.signOut().then(() => {
                // Handle sign out
            }).catch((error) => {
                console.log(error);
            });
        } else {
            router.navigate("/calendar");
        }*/
    };

    const renderAnnouncements = () => {
        var sortedAnnouncements = announcements.sort((a, b) => {
            return new Date(b.time_sent).getTime() - new Date(a.time_sent).getTime();
        });
        sortedAnnouncements = sortedAnnouncements.slice(0, 3);
        return sortedAnnouncements.map((announcement, key) => (
            <View key={key} style={{ margin: 5, padding: 10, backgroundColor: 'white', borderRadius: 20, height: 60, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {announcement.title}
                </Text>
            </View>
        ));
    };

    //const auth = getAuth(app);
    //const isSignedIn = auth.currentUser ? true : false;
    const selectedTeamDetails = teams.find(team => team.id === selectedTeam);
    
    return (
        <ScrollView>
            <SafeAreaView style={[styles.container,{paddingBottom: insets.bottom}]}>
                <View style={styles.logo_container}> 
                    <Image source={require('../../../assets/images/logo_avec_titre.png')} style={{ width: width * 0.8, height: width * 0.4 }} />
                </View>
                <View style={styles.description_container}>
                    <Text>
                        {"Cette application te permettra de suivre la progression du tournoi Atlanticup 2024 en temps réel! \nTu pourras aussi suivre les messages d'information donnés par les organisateurs."}
                    </Text>
                </View>

                <View style={styles.annoucements_container}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                        {"Liste des annonces :"}
                    </Text>

                    <ScrollView style={{ flex: 1, margin: 10 }}>
                        {announcements.length > 0 ? renderAnnouncements() : <Text style={{ textAlign: 'center' }}>Aucune annonce pour le moment.</Text>}
                    </ScrollView>
                    <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => router.navigate("/other/announcements")}>
                        <Text style={{ color: 'blue', fontWeight: 'bold' }}>Tout voir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.team_selection_container}>
                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>
                        {"Mon équipe :"}
                    </Text>

                    <TouchableOpacity style={{ backgroundColor: '#4287f5', borderRadius: 20, padding: 10, margin: 10, justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalVisible(true)}>
                        {
                            selectedTeamDetails != null ?
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={{ uri: selectedTeamDetails.image }} style={{ width: 100, height: 100 }} />
                                    <Text style={{ textAlign: 'center', fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                                        {selectedTeamDetails.title}
                                    </Text>
                                </View>
                                :
                                <Text style={{ textAlign: 'center', fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                                    {"Sélectionner mon équipe"}
                                </Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setSelectedTeam(null); AsyncStorage.removeItem("atlanticup_team") }} style={{ padding: 5, margin: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', fontSize: 12, color: 'grey', fontWeight: 'bold' }}>
                            {"Réinitialiser mon équipe"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.legal_notices_container}>
                    <TouchableOpacity onPress={() => router.navigate("/other/legalNotices")}>
                        <Text style={{ color: 'blue' }}>Mentions légales</Text>
                    </TouchableOpacity>
                </View>

                {true ?
                    <TouchableOpacity onPress={signInButtonPressed} style={styles.legal_notices_container}>
                        <Text style={{ color: 'blue' }}>Se déconnecter</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={signInButtonPressed} style={styles.legal_notices_container}>
                        <Text style={{ color: 'blue' }}>Se connecter en tant qu'organisateur</Text>
                    </TouchableOpacity>
                }
            </SafeAreaView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setModalVisible(false) }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modal_container}>
                        <FlatList
                            numColumns={2}
                            data={teams}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => { setSelectedTeam(item.id); setModalVisible(false); AsyncStorage.setItem("atlanticup_team", item.id); }} style={{ width: width * 0.4, height: 150, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 20 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 14, alignSelf: 'center' }}>
                                        {item.title}
                                    </Text>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: item.image }} style={{ width: width * 0.3, height: width * 0.3 }} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 30
    },
    logo_container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    description_container: {
        marginBottom: 20,
    },
    annoucements_container: {
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginBottom: 20,
        padding: 10,
    },
    team_selection_container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    legal_notices_container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    modal_container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
    }
});

export default ProfileScreen;
