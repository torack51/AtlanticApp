import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { atlanticupGetAllAnnouncements } from '../../../backend/atlanticupBackendFunctions';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import AtlanticupAnnouncementItem from '../../../components/Atlanticup/AtlanticupAnnouncementItem';

const AtlanticupAnnouncementsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const announcements = await atlanticupGetAllAnnouncements();
            setAnnouncements(announcements);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <FlatList
                data={announcements}
                renderItem={({ item }) => <AtlanticupAnnouncementItem item={item} navigation={navigation} />}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchAnnouncements}
                    />
                }
                style={{ width: '100%', padding: 10, alignSelf: 'center' }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    topBar: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    topText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
});

export default AtlanticupAnnouncementsScreen;
