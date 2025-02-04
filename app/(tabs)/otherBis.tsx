import React, { Component } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { atlanticupGetAllAnnouncements } from '../../backend/atlanticupBackendFunctions';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import AtlanticupAnnouncementItem from '../../components/Atlanticup/AtlanticupAnnouncementItem';

interface Announcement {
    id: string;
    // Add other properties of Announcement here
}

interface AtlanticupOthersScreenState {
    announcements: Announcement[];
    loading: boolean;
}

interface AtlanticupOthersScreenProps {
    navigation: any; // You can replace `any` with the specific type if you know it
}

class AtlanticupOthersScreen extends React.Component<AtlanticupOthersScreenProps, AtlanticupOthersScreenState> {
    constructor(props: AtlanticupOthersScreenProps) {
        super(props);
        this.state = {
            announcements: [],
            loading: false,
        };
    }

    fetchAnnouncements = async () => {
        this.setState({ loading: true });
        try {
            const announcements = await atlanticupGetAllAnnouncements();
            this.setState({
                announcements: announcements,
                loading: false,
            });
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }
    };

    componentDidMount() {
        this.fetchAnnouncements();
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.loading && <ActivityIndicator size="large" color="#0000ff" />}
                <FlatList
                    data={this.state.announcements}
                    renderItem={({ item }) => <AtlanticupAnnouncementItem item={item} navigation={this.props.navigation} />}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={this.fetchAnnouncements}
                        />
                    }
                    style={{ width: '100%', padding: 10, alignSelf: 'center' }}
                />
            </View>
        );
    }
}

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

export default AtlanticupOthersScreen;