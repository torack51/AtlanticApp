import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { atlanticupGetPlaceFromId } from '../backend/atlanticupBackendFunctions';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
interface Props {
    item: {
        id: string;
        title: string;
        description: string;
        time_sent: string;
        place_id: string | null;
    };
    router: any;
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

class AtlanticupAnnouncementItem extends React.Component<Props, State> {
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
        if (this.state.place){
        }
    return (
        <SafeAreaView style={styles.announcementContainer}>
            <View style={{padding:5}}>
                <Text>{(new Date (announcement.time_sent)).toLocaleDateString()} {(new Date (announcement.time_sent)).getHours()}:{(new Date (announcement.time_sent)).getMinutes().toString().padStart(2,"0")}</Text>
            </View>
            <View style={{padding:5}}>
                <Text style={styles.bigText}>{announcement.title}</Text>
            </View>
            <View style={{padding:10}}>
                <Text style={styles.smallText}>{announcement.description.replace(/\\n/g, "\n")}</Text>
            </View>
            {
                !this.state.noPlace &&
                <TouchableOpacity onPress={() => this.props.router.navigate(`/map?location=${this.state.place.id}`)} style={{padding:10, alignItems:'center'}}>
                    <Text style={[styles.smallText, {color:'blue'}]}>{this.state.place ? this.state.place.title : ''}</Text>
                </TouchableOpacity>
            }
        </SafeAreaView>
        
    )
    }
}

const styles = StyleSheet.create({
    announcementContainer:{
        width: '90%',
        marginVertical: 10,
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignSelf: 'center',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    bigText:{
        fontSize:20,
        fontWeight:'bold',
        alignSelf:'center',
    },
    smallText:{
        fontSize:15,
    },
});

export default AtlanticupAnnouncementItem;