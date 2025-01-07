import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { atlanticupGetPlaceFromId } from '../../backend/atlanticupBackendFunctions';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
    item: {
        id: string;
        title: string;
        description: string;
        time_sent: string;
        place_id: string | null;
    };
    navigation: any;
}

interface State {
    announcement: {
        id: string;
        title: string;
        description: string;
        time_sent: string;
        place_id: string | null;
    };
    loading: boolean;
    place: any;
    noPlace: boolean;
}

class AtlanticupAnnouncementannouncement extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            announcement : this.props.item,
            loading:false,
            place : null,
            noPlace : true,
        };
    }

    fetchPlace = async () =>{
        this.setState({loading:true});
        try{
            if (!this.state.announcement.place_id){
                this.setState({loading:false, noPlace:true});
                return;
            }
            const place = await atlanticupGetPlaceFromId(this.state.announcement.place_id);
            this.setState({
                place: place,
                noPlace:false,
                loading:false,
            })
        }
        catch(error){
            console.log(error);
            this.setState({loading:false, noPlace:true});
        }
    }

    componentDidMount(){
        this.fetchPlace();
    }

    render() {
        const announcement = this.state.announcement;
        const time_sent = new Date(announcement.time_sent);
        if (this.state.place){
        }
    return (
        <SafeAreaView style={styles.announcementContainer}>
            <View>
                <Text>{time_sent.toLocaleDateString()} {time_sent.getHours()}:{time_sent.getMinutes().toString().padStart(2,"0")}</Text>
            </View>
            <View style={{padding:5}}>
                <Text style={styles.bigText}>{announcement.title}</Text>
            </View>
            <View style={{padding:10}}>
                <Text style={styles.smallText}>{announcement.description.replace(/\\n/g, "\n")}</Text>
            </View>
            {
                !this.state.noPlace &&
                <View style={{position:'absolute', bottom:0, right:0, padding:5}}>
                <TouchableOpacity onPress={() => null}>
                    <Text style={[styles.smallText, {color:'blue'}]}>{this.state.place ? this.state.place.title : ''}</Text>
                </TouchableOpacity>
                </View>
            }
        </SafeAreaView>
    )
    }
}

const styles = StyleSheet.create({
    announcementContainer:{
        padding:15,
        paddingBottom:30,
        margin:10,
        borderRadius:10,
        backgroundColor:'rgba(0,0,0,0.1)',
    },
    bigText:{
        fontSize:20,
        fontWeight:'bold',
        alignSelf:'center',
    },
    smallText:{
        fontSize:15,
    }
});

export default AtlanticupAnnouncementannouncement;