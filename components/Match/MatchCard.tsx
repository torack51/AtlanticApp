import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import HeadToHeadMatchCard from './HeadToHeadMatchCard';
import RankedMatchCard from './RankedMatchCard';

interface MatchCardProps {
    match: any;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
    switch (match.type){
        case "head_to_head_match":
            return <HeadToHeadMatchCard match={match}/>;
        case "ranked_match":
            return <RankedMatchCard match={match}/>;
            break;
        default:
            console.warn('Unknown match type:', match.type);
            return <></>
            break;
    }
};

export default MatchCard;