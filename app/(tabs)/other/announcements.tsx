import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { atlanticupGetAllAnnouncements } from '../../../backend/atlanticupBackendFunctions';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import AtlanticupAnnouncementItem from '../../../components/AtlanticupAnnouncementItem';
import ScreenLoader from '@/components/ScreenLoader';

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

    const router = useRouter();

    return (
        <View style={styles.container}>
            {loading && 
                <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                    <View style={{height:200, width:200}}>
                        <ScreenLoader/>
                    </View>
                </View>
            }
            <FlatList
                data={announcements}
                renderItem={({ item }) => <AtlanticupAnnouncementItem item={item} router={router} />}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchAnnouncements}
                    />
                }
                style={{ width: '100%', alignSelf: 'center'}}
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
