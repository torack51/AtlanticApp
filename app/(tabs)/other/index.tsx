import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { atlanticupGetAllAnnouncements, atlanticupGetAllDelegations } from '../../../backend/atlanticupBackendFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLoader from '@/components/ScreenLoader';
import { getUserByUid } from '@/backend/firestore/usersService';
import { switchToAnonymousAfterLogout } from '@/backend/auth/authService';
import SchoolPicker from '@/components/SchoolPicker';

const width = Dimensions.get('window').width;

interface Announcement {
    id: string;
    title: string;
    time_sent: string;
    description: string;
}

interface Team {
    id: string;
    title: string;
    image: string;
}

const ProfileScreen: React.FC = () => {
    const [schoolModalVisible, setSchoolModalVisible] = useState<boolean>(false);
    const [sportsModalVisible, setSportsModalVisible] = useState<boolean>(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
    const [selectedTeamImage, setSelectedTeamImage] = useState<string | null>(null);
    const [selectedTeamColor, setSelectedTeamColor] = useState<string | null>(null);
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [sports, setSports] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [initializing, setInitializing] = useState<boolean>(true);

    const insets = useSafeAreaInsets();

    const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
        if (!user) {
            setCurrentUser(null);
            return;
        }

        let userData = null;
        let attempts = 0;

        await new Promise((resolve) => setTimeout(resolve, 300));

        while (!userData && attempts < 5) {
            try {
                userData = await getUserByUid(user.uid);
                setInitializing(false);
                console.log("Utilisateur récupéré :", userData);
            if (userData) break;
            } catch (err) {
                console.warn("Erreur pendant getUserByUid:", err);
            }

            attempts++;
            await new Promise((res) => setTimeout(res, 300)); // 300ms d'attente
        }

        if (!userData) {
            console.warn("Utilisateur authentifié mais document Firestore introuvable :", user.uid);
            setCurrentUser(null);
            return;
        }

        setCurrentUser(userData);
    };


    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        fetchAnnouncements();
        getTeamFromStorage();
        fetchTeams();

        return () => subscriber();
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
        router.push("/auth/connexion");
    };

    const signOutButtonPressed = async () =>{
        setInitializing(true);
        await switchToAnonymousAfterLogout();
        setInitializing(false);
    }

    const renderAnnouncements = () => {
        var sortedAnnouncements = announcements.sort((a, b) => {
            return new Date(b.time_sent).getTime() - new Date(a.time_sent).getTime();
        });
        sortedAnnouncements = sortedAnnouncements.slice(0, 3);
        return sortedAnnouncements.map((announcement, key) => (
            <View key={key} style={{ margin: 5, padding: 10, backgroundColor: 'white', borderRadius: 20, height: 200, width: 200, justifyContent: 'center', alignItems: 'center' }}>
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {announcement.title}
                    </Text>
                </View>
                <View style={{flex:1, justifyContent:'center'}}>
                    <Text numberOfLines={6} ellipsizeMode='tail'>
                        {announcement.description.replace(/\\n/g, "\n")}
                    </Text>
                </View>
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
                    <Image source={require('../../../assets/images/logo-atlanticup-no-background.png')} style={{ width: width * 0.6, height: width * 0.5}} />
                </View>

                <View style={styles.annoucements_container}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, color:'white' }}>
                        {"⚠️ ANNONCES ⚠️"}
                    </Text>

                    {loadingAnnouncements ? <View style={{height:200,width:200, alignSelf:'center'}}><ScreenLoader /></View> : 
                        <>
                        <ScrollView style={{ flex: 1, margin: 10 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                            {announcements.length > 0 ? renderAnnouncements() : <Text style={{ textAlign: 'center' }}>Aucune annonce pour le moment.</Text>}
                        </ScrollView>
                        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => router.navigate("/other/announcements")}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Tout voir</Text>
                        </TouchableOpacity>
                        </>
                    }
                </View>

                <View style={styles.selector_container}>

                    <View style={styles.team_selection_container}>
                        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>
                            {"Mon équipe :"}
                        </Text>

                        <TouchableOpacity style={{padding: 10, margin: 10, justifyContent: 'center', alignItems: 'center' }} onPress={() => setSchoolModalVisible(true)}>
                            {
                                selectedTeamDetails != null ?
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: selectedTeamDetails.image }} style={{ width: 100, height: 100 }} />
                                        <Text style={{ textAlign: 'center', fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                                            {selectedTeamDetails.title}
                                        </Text>
                                    </View>
                                    :
                                    <View style={{width:'100%', aspectRatio:1, justifyContent:'center', alignItems:'center', backgroundColor:'green'}}>
                                        <SchoolPicker selectedSchoolID={selectedTeam} selectedSchoolName={selectedTeamDetails?.title} selectedSchoolImage={selectedTeamDetails?.image} selectedSchoolColor={selectedTeamDetails?.color} />
                                    </View>
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sports_selection_container}>
                        <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>
                            {"Mes sports :"}
                        </Text>

                        <TouchableOpacity style={{ backgroundColor: '#4287f5', borderRadius: 20, padding: 10, margin: 10, justifyContent: 'center', alignItems: 'center' }} onPress={() => setSportsModalVisible(true)}>
                            {

                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setSelectedSports([]); AsyncStorage.removeItem("atlanticup_sports") }} style={{ padding: 5, margin: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ textAlign: 'center', fontSize: 12, color: 'grey', fontWeight: 'bold' }}>
                                {"Réinitialiser mes sports"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={styles.legal_notices_container}>
                    <TouchableOpacity onPress={() => router.navigate("/other/legalNotices")}>
                        <Text style={{ color: 'blue' }}>Mentions légales</Text>
                    </TouchableOpacity>
                </View>

                {initializing ?
                    <TouchableOpacity style={styles.legal_notices_container}>
                        <Text style={{ color: 'blue' }}>Chargement...</Text>
                    </TouchableOpacity>
                    :
                    (currentUser && (
                    currentUser.anonymous ?
                        <TouchableOpacity onPress={signInButtonPressed} style={styles.legal_notices_container}>
                            <Text style={{ color: 'blue' }}>Se connecter</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={signOutButtonPressed} style={styles.legal_notices_container}>
                            <Text style={{ color: 'blue' }}>Se déconnecter</Text>
                        </TouchableOpacity>
                    ))
                }
            </SafeAreaView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={schoolModalVisible}
                onRequestClose={() => { setSchoolModalVisible(false) }}
            >
                <TouchableWithoutFeedback onPress={() => setSchoolModalVisible(false)}>
                    <View style={styles.modal_container}>
                        <View style={styles.modal_list_container}>
                            <FlatList
                                numColumns={2}
                                data={teams}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => { setSelectedTeam(item.id); setSchoolModalVisible(false); AsyncStorage.setItem("atlanticup_team", item.id); }} style={styles.team_card}>
                                        <Image source={{ uri: item.image }} style={styles.team_card_image} />
                                        <Text style={styles.team_card_text}>{item.title}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text>Aucune équipe trouvée</Text>}
                            />
                                <TouchableOpacity onPress={() => { setSelectedTeam(null); setSchoolModalVisible(false); AsyncStorage.setItem("atlanticup_team", 'null'); }} style={{ margin: 10, padding: 10, backgroundColor: '#4287f5', borderRadius: 20 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Réinitialiser</Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logo_container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    description_container: {
        marginBottom: 20,
        marginHorizontal: 20,
    },
    annoucements_container: {
        height:300,
        borderRadius: 0,
        backgroundColor: '#4287f5',
        marginBottom: 20,
        padding: 10,
    },
    selector_container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 20,
    },
    team_selection_container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex:2,
    },
    sports_selection_container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex:3,
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
        justifyContent: 'center',
    },
    modal_list_container: {
        height: '70%',
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    team_card: {
        width: width*0.3,
        aspectRatio: 1,
        margin: 10,
        marginVertical: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    team_card_image: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
        marginBottom: 10,
    },
    team_card_text: {
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
    },
});

export default ProfileScreen;
