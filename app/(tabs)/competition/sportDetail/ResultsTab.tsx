import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, RefreshControl, Image, ScrollView } from 'react-native';
import { atlanticupGetGroupsFromSportId, atlanticupGetDelegationFromId, atlanticupGetMatchesFromSportId, atlanticupGetTeamFromId, atlanticupGetSportFromId } from '../../../backend/atlanticupBackendFunctions';
import { giveResults, sortTeams } from '../../../backend/pointsPerMatchBySports';
import AtlanticupRankingType1 from '../../../components/Atlanticup/Ranking/AtlanticupRankingType1';
import AtlanticupRankingType2 from '../../../components/Atlanticup/Ranking/AtlanticupRankingType2';
import AtlanticupRankingType3 from '../../../components/Atlanticup/Ranking/AtlanticupRankingType3';

const width = Dimensions.get('window').width;

interface ResultsTabProps {
    sport_id: any;
}

const ResultsTab: React.FC<ResultsTabProps> = ({sport_id}) => {
    const [sport, setSport] = useState<any>({});
    const [groups, setGroups] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [delegations, setDelegations] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);

    const computeScores = useCallback(async () => {
        if (sport_id === 'climbing_m' || sport_id === 'climbing_f' || sport_id === 'running') {
            return;
        }

        const updatedGroups = groups.map(group => {
            group.teams = group.teams.map(team => ({
                points: 0,
                gamesPlayed: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                team_id: team,
                ...teams.find(t => t.id === team),
                ...delegations.find(d => d.id === teams.find(t => t.id === team)?.delegation),
            }));
            return group;
        });

        matches.forEach(match => {
            if (match.sport_id === sport_id && match.category === "gs" && (match.status === "played" || match.status === "forfait")) {
                const group = updatedGroups.find(g => g.group_no === match.group);
                if (group) {
                    const team1 = group.teams.find(team => team.team_id === match.team1_id);
                    const team2 = group.teams.find(team => team.team_id === match.team2_id);

                    if (team1 && team2) {
                        const result = giveResults(match.team1_score, match.team2_score, match.sport_id);

                        team1.gamesPlayed += 1;
                        team2.gamesPlayed += 1;

                        switch (sport.id) {
                            case 'table_tennis':
                            case 'badminton':
                                team1.wins += result.winner === 1 ? 1 : 0;
                                team2.wins += result.winner === 2 ? 1 : 0;

                                team1.losses += result.winner === 2 ? 1 : 0;
                                team2.losses += result.winner === 1 ? 1 : 0;

                                team1.goalsFor += result.team1_score;
                                team2.goalsFor += result.team2_score;

                                team1.goalsAgainst += result.team2_score;
                                team2.goalsAgainst += result.team1_score;
                                break;
                            default:
                                team1.wins += result.winner === 1 ? 1 : 0;
                                team2.wins += result.winner === 2 ? 1 : 0;

                                team1.draws += result.winner === 0 ? 1 : 0;
                                team2.draws += result.winner === 0 ? 1 : 0;

                                team1.losses += result.winner === 2 ? 1 : 0;
                                team2.losses += result.winner === 1 ? 1 : 0;

                                team1.goalsFor += result.team1_score;
                                team2.goalsFor += result.team2_score;

                                team1.goalsAgainst += result.team2_score;
                                team2.goalsAgainst += result.team1_score;

                                team1.points += result.team1_points;
                                team2.points += result.team2_points;
                                break;
                        }
                    }

                    group.teams[group.teams.findIndex(team => team.team_id === team1.team_id)] = team1;
                    group.teams[group.teams.findIndex(team => team.team_id === team2.team_id)] = team2;
                }

                const newRanking = sortTeams(group.teams, sport_id);
                group.teams = newRanking;
            }
        });
        setGroups(updatedGroups);
        setLoaded(true);
    }, [groups, teams, delegations, matches, sport_id]);

    const fetchTeams = async (teams_id_list: string[]) => {
        const teams = await Promise.all(teams_id_list.map(team_id => atlanticupGetTeamFromId(team_id)));
        return teams;
    };

    const fetchDelegations = async (delegations_id_list: string[]) => {
        const delegations = await Promise.all(delegations_id_list.map(delegation_id => atlanticupGetDelegationFromId(delegation_id)));
        return delegations;
    };

    const getTeamsFromGroups = async (groups: any[]) => {
        const teamsPromises = groups.map(group =>
            Promise.all(group.teams.map((team_id: string) => atlanticupGetTeamFromId(team_id)))
        );
        const resolvedTeams = await Promise.all(teamsPromises);
        return resolvedTeams.flat();
    };

    const fetchAll = useCallback(async () => {
        setLoaded(false);
        try {
            const sportData = await atlanticupGetSportFromId(sport_id);
            const groupsData = await atlanticupGetGroupsFromSportId(sport_id);
            const matchesData = await atlanticupGetMatchesFromSportId(sport_id);
            const teamsData = await getTeamsFromGroups(groupsData);
            const delegationsData = await fetchDelegations(teamsData.map(team => team.delegation));

            setGroups(groupsData);
            setMatches(matchesData);
            setTeams(teamsData);
            setDelegations(delegationsData);
            setLoaded(true);
            computeScores();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [sport_id, computeScores]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const renderType1Ranking = (groups: any[]) => {
        return (
            groups.map((group, index) => (
                <AtlanticupRankingType1 teams={group.teams} description={group.description} key={index} />
            ))
        );
    };

    const renderType2Ranking = (groups: any[]) => {
        return (
            groups.map((group, index) => (
                <AtlanticupRankingType2 teams={group.teams} description={group.description} key={index} />
            ))
        );
    };

    const renderType3Ranking = (groups: any[]) => {
        return (
            groups.map((group, index) => (
                <AtlanticupRankingType3 teams={group.teams} description={group.description} key={index} />
            ))
        );
    };

    const renderRanking = (groups: any[], sport_id: string) => {
        switch (sport_id) {
            case 'football_m':
            case 'football_f':
            case 'handball':
            case 'rugby_m':
            case 'ultimate':
            case 'basketball_m':
            case 'basketball_f':
            case 'volleyball_m':
            case 'volleyball_f':
                return renderType1Ranking(groups);
            case 'badminton':
                return renderType2Ranking(groups);
            case 'table_tennis':
                return renderType3Ranking(groups);
            case 'climbing_m':
            case 'climbing_f':
            case 'running':
                return <></>;
            default:
                console.error("sortTeams - sport pas reconnu");
                return <></>;
        }
    };

    const renderFinalRanking = (ranking: any[]) => {
        const t = ranking.map((team, index) => (
            teams.find(t => t.id === team)
        ));

        const finalTeams = t.map(team => ({
            ...team,
            ...delegations.find(d => d.id === team?.delegation),
        }));

        if (loaded) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', margin: 10, padding: 20 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Classement final</Text>
                    {finalTeams.map((team, index) => (
                        <View style={{ flexDirection: 'row', margin: 10, width: width * 0.85, justifyContent: 'space-between', alignItems: 'center' }} key={index}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{index + 1}   {team?.title} {team?.description}</Text>
                            <Image source={{ uri: team?.image }} style={{ width: 80, height: 80 }} />
                        </View>
                    ))}
                </View>
            );
        } else {
            return <></>;
        }
    };

    return (
        <View style={styles.main_container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={!loaded} onRefresh={fetchAll} />}
            >
                {renderRanking(groups, sport_id)}
                <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>{sport.ranking_description}</Text>
                </View>
                {sport.ranking ? renderFinalRanking(sport.ranking) :
                    <View style={{ alignItems: 'center', height: 80, justifyContent: 'center', padding: 15 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Pas de classement définitif pour l'instant</Text>
                    </View>
                }
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
    },
    item: {
        height: 40,
        width: '100%',
        borderColor: '#888',
        borderWidth: 1,
        justifyContent: 'center',
        padding: 10,
    },
    header: {
        height: 30,
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontWeight: 'bold',
    },
});

export default ResultsTab;
