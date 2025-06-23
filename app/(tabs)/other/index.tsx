import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, Alert, Touchable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { atlanticupGetAllAnnouncements } from '../../../backend/atlanticupBackendFunctions';
import { getAllDelegations } from '@/backend/firestore/schoolsService';
import { getAllSports } from '@/backend/firestore/sportsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLoader from '@/components/ScreenLoader';
import { getUserByUid } from '@/backend/firestore/usersService';
import { switchToAnonymousAfterLogout } from '@/backend/auth/authService';
import SchoolPicker from '@/components/SchoolPicker';
import { updateUser } from '@/backend/firestore/usersService';
import AnimatedSportsCard from '@/components/AnimatedSportsCard';

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

interface Sport {
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
    const [selectedTeamColor, setSelectedTeamColor] = useState<string | null>(null);
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [loadingUser, setLoadingUser] = useState<boolean>(false);
    const [sports, setSports] = useState<Sport[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [initializing, setInitializing] = useState<boolean>(true);

    const insets = useSafeAreaInsets();

    const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
        setLoadingUser(true);
        if (!user) {
            setLoadingUser(false);
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
            setLoadingUser(false);
            return;
        }

        const team = userData?.supported_team || null;
        const sports = userData?.followed_sports || [];
        if (team) {
            setSelectedTeam(team);
        }
        if (sports && sports.length > 0) {
            setSelectedSports(sports);
        } else {
            setSelectedSports([]);
        }
        setCurrentUser(userData);
        setLoadingUser(false);
    };


    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        fetchAnnouncements();
        fetchTeams();
        fetchSports();

        return () => subscriber();
    }, []);

    const fetchTeams = async () => {
        const teams = await getAllDelegations();
        setTeams(teams);
    };

    const fetchSports = async () => {
        const sportsList = await getAllSports();
        setSports(sportsList);
    }

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

    const handleSchoolSelected = async (school_id : string | null) => {
        setSchoolModalVisible(false);
        setLoadingUser(true);

        const uid = currentUser?.uid;
        if (!uid) {
            console.warn("Aucun utilisateur connecté pour mettre à jour l'équipe.");
            Alert.alert("Erreur", "Aucun utilisateur connecté pour mettre à jour l'équipe.");
            setLoadingUser(false);
            return;
        }
        await updateUser(uid, {supported_team: school_id});

        if (school_id === null) {
            setSelectedTeam(null);
            setSelectedTeamColor(null);
            await AsyncStorage.setItem("atlanticup_team", 'null');
        } else {
            const selectedTeamDetails = teams.find(team => team.id === school_id);
            if (selectedTeamDetails) {
                setSelectedTeam(school_id);
                setSelectedTeamColor(selectedTeamDetails.color);
                await AsyncStorage.setItem("atlanticup_team", school_id);
            } else {
                console.warn("Équipe sélectionnée introuvable :", school_id);
                Alert.alert("Erreur", "Équipe sélectionnée introuvable.");
                setSelectedTeam(null);
                setSelectedTeamColor(null);
                await AsyncStorage.setItem("atlanticup_team", 'null');
            }
        }
        Alert.alert("Succès", "Votre délégation a été mise à jour.");
        setLoadingUser(false);
    }

    const handleSportToggled = async (sport_id: string) => {
        if (selectedSports.includes(sport_id)) {
            setSelectedSports(selectedSports.filter(id => id !== sport_id));
        } else {
            setSelectedSports([...selectedSports, sport_id]);
        }
    }

    const handleSportsChanges = async () => {
        setSportsModalVisible(false);
        const uid = currentUser?.uid;
        if (!uid) {
            console.warn("Aucun utilisateur connecté pour mettre à jour les sports.");
            Alert.alert("Erreur", "Aucun utilisateur connecté pour mettre à jour les sports.");
            return;
        }
        await updateUser(uid, {followed_sports: selectedSports});
        Alert.alert("Succès", "Vos sports ont été mis à jour.");
    };

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
        <ScrollView showsVerticalScrollIndicator={false}>
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

                    <View style={styles.selector_titles_container}>
                        <View style={{flex:2, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                                {"Mon équipe"}
                            </Text> 
                        </View>
                        <View style={{flex:3, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                                {"Mes sports"}
                            </Text>
                        </View>
                    </View>

                    <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center', width:'100%'}}>
                        <View style={styles.team_selection_container}>
                            {!loadingUser ? 
                            <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', width:'100%'}} onPress={() => setSchoolModalVisible(true)}>
                                {
                                    selectedTeamDetails != null ?
                                        <View style={{ justifyContent: 'center', alignItems: 'center', width:width*3/10, aspectRatio:1}}>
                                            <Image source={{ uri: selectedTeamDetails.image }} style={{ width: '100%', aspectRatio:1}} />
                                        </View>
                                        :
                                        <View style={{justifyContent: 'center', alignItems: 'center', width:width*3/10, aspectRatio:1}}>
                                            <SchoolPicker selectedSchoolID={selectedTeam} selectedSchoolName={selectedTeamDetails?.title} selectedSchoolImage={selectedTeamDetails?.image} selectedSchoolColor={selectedTeamDetails?.color} />
                                        </View>
                                }
                            </TouchableOpacity>
                            : 
                            null}
                        </View>

                        <View style={styles.sports_selection_container}>
                            <TouchableOpacity style={{}} onPress={() => setSportsModalVisible(true)}>
                            <AnimatedSportsCard height={3*width/10} width={3*width/5}/>
                            </TouchableOpacity>
                        </View>
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
                                    <TouchableOpacity onPress={() => handleSchoolSelected(item.id)} style={styles.team_card}>
                                        <Image source={{ uri: item.image }} style={styles.team_card_image} />
                                        <Text style={styles.team_card_text}>{item.title}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text>Aucune équipe trouvée</Text>}
                            />
                                <TouchableOpacity onPress={() => handleSchoolSelected(null)} style={{ margin: 10, padding: 10, backgroundColor: '#4287f5', borderRadius: 20 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Réinitialiser</Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                visible={sportsModalVisible}
                onRequestClose={() => { setSportsModalVisible(false) }}
            >
                <TouchableWithoutFeedback>
                    <View style={styles.modal_container}>
                        <View style={styles.modal_list_container}>
                            <FlatList
                                data={sports}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSportToggled(item.id)} style={styles.sport_card}>
                                        <Image source={{ uri: item.image }} style={[styles.sport_card_image, selectedSports.includes(item.id) && { tintColor: 'green' }]} />
                                        <Text numberOfLines={2} style={[styles.sport_card_text, selectedSports.includes(item.id) && { color: 'green' }]}>{item.title}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text>Aucune équipe trouvée</Text>}
                                ListHeaderComponent={
                                    <View style={{ width: '100%', alignItems: 'center', marginVertical: 20, paddingHorizontal: 20 }}>
                                        <Text style={{ fontSize: 12 }}>Sélectionne les sports qui t'intéressent. Tu seras notifié quand leurs matchs commenceront!</Text>
                                    </View>
                                }
                            />
                                <TouchableOpacity onPress={handleSportsChanges} style={{ margin: 10, padding: 10, backgroundColor: '#4287f5', borderRadius: 20 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Terminer</Text>
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
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    selector_titles_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
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
        marginVertical: 30,
        justifyContent: 'center',
        alignItems: 'center',
        margin:10,
    },
    team_card_image: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
        marginBottom: 10,
    },
    sport_card: {   
        width: width*0.6,
        height:50,
        alignItems: 'center',
        flexDirection:'row',
        margin:5,
    },
    sport_card_image: {
        height:'90%',
        aspectRatio: 1,
        tintColor:'black',
        marginRight: 10,
    },
    sport_card_text: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 5,
    },
    team_card_text: {
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
    },
});

export default ProfileScreen;
