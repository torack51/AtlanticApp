import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const width = Dimensions.get('window').width;

interface Team {
    title: string;
    description: string;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
}

interface TeamItemType2Props {
    team: Team;
}

const TeamItemType2: React.FC<TeamItemType2Props> = ({ team }) => (
    <View style={styles.team_item}>
        <View style={{ width: 120 }}>
            <Text style={{ fontWeight: 'bold' }}>{team.title} {team.description}</Text>
        </View>
        <View style={styles.ranking_details}>
            <View style={styles.ranking_item}>
                <Text>{team.gamesPlayed}</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text>{team.wins}</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text>{team.draws}</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text>{team.losses}</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text>{team.goalsFor}</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text>{team.goalsAgainst}</Text>
            </View>
        </View>
    </View>
);

interface RankingItemType2Props {
    teams: Team[];
    description: string;
}


const RankingItemType2: React.FC<RankingItemType2Props> = ({ teams, description }) => (
    <View style={styles.ranking_container}>
        <View style={styles.ranking_header}>
            <View style={{ width: 120 }}>
                <Text style={{ fontWeight: 'bold' }}>{description}</Text>
            </View>
            <View style={styles.ranking_details}>
                <Text style={{fontWeight:'bold', fontSize:12}}>P</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text style={{fontWeight:'bold', fontSize:12}}>Set+</Text>
            </View>
            <View style={styles.ranking_item}>
                <Text style={{fontWeight:'bold', fontSize:12}}>Set-</Text>
            </View>
        </View>

        {teams.map(team => (
            <TeamItemType2 team={team} />
        ))}

    </View>
);


const AtlanticupRankingType2 = ({teams, key, description}) => {
    return (
        <View style={styles.container}>
            <RankingItemType2 teams={teams} description={description} key={key}/>
        </View>
    );
};

const styles = StyleSheet.create({
    ranking_container:{
        width:width,
        padding:10,
        borderWidth:1,
        borderColor:'#888',
        marginBottom:10,
    },
    team_item:{
        paddingHorizontal:10,
        height:40,
        borderColor:'#888',
        borderWidth:1,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
    ranking_details:{
        flex:1,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
    ranking_item:{
        flex:1,
        maxWidth:30,
        justifyContent:'center',
        alignItems:'center',
    },
    ranking_header:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom:10,
    },
});

export default AtlanticupRankingType2;