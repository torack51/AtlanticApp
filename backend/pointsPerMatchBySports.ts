/*
FOOTBALL M ET F : VICTOIRE = 3, NUL = 1, DEFAITE = 0
BASKETBALL M ET F : VICTOIRE = 3, NUL = 2, DEFAITE = 1  FORFAIT = 0
HANDBALL M ET F : VICTOIRE = 3, NUL = 1, DEFAITE = 0, FORFAIT = 0 et 10-0
VOLLEYBALL M ET F : VICTOIRE 2-0 = 3 VICTOIRE 2-1 = 2, DEFAITE 2-1 = 1, DEFAITE 2-0 = 0
RUGBY M : VICTOIRE = 4, NUL = 2, DEFAITE = 1, FORFAIT = 0
RELAIS : PAS DE POINTS
ESCALADE : PAS DE POINTS
BADMINTON : nombre de victoires > confrontations directes > nombre de sets gagnés > nombre de points gagnés
ULTIMATE VICTOIRE = 3, NUL = 1, DEFAITE = 0
TENNIS DE TABLE : Nombre de sets gagnés > confrontation directe

*/

type Result = {
    winner: number;
    team1_score: number;
    team2_score: number;
};

const giveWinnerType1 = (team1_score: number, team2_score: number): Result => {
    const winner = team1_score > team2_score ? 1 : team1_score < team2_score ? 2 : 0;
    return { winner, team1_score, team2_score };
};

const giveWinnerType2 = (team1_score: number[], team2_score: number[]): Result => {
    let team1_sets = 0;
    let team2_sets = 0;

    if (team1_score.length !== team2_score.length) {
        console.error("giveWinnerType2 - types inhomogènes");
    }

    for (let i = 0; i < team1_score.length; i++) {
        team1_score[i] > team2_score[i] ? team1_sets++ : team1_score[i] < team2_score[i] ? team2_sets++ : null;
    }
    const winner = team1_sets > team2_sets ? 1 : team1_sets < team2_sets ? 2 : 0;
    return { winner, team1_score: team1_sets, team2_score: team2_sets };
};

const giveResults = (
    team1_score: number | number[],
    team2_score: number | number[],
    sport_id: string,
    forfait: boolean
): { winner: number; team1_points: number; team2_points: number; team1_score: number | number[]; team2_score: number | number[] } | void => {
    let result: Result;
    let team1_points: number;
    let team2_points: number;

    switch (sport_id) {
        case 'football':
        case 'handball':
        case 'basketball':
        case 'rugby':
        case 'ultimate':
            result = giveWinnerType1(team1_score as number, team2_score as number);
            switch (sport_id) {
                case 'football':
                case 'ultimate': //Victoire = 3, Nul = 1, Défaite = 0
                    team1_points = result.winner === 1 ? 3 : result.winner === 0 ? 1 : 0;
                    team2_points = result.winner === 2 ? 3 : result.winner === 0 ? 1 : 0;
                    return { winner: result.winner, team1_points, team2_points, team1_score, team2_score };

                case 'handball': //Victoire = 3, Nul = 1, Défaite = 0, Forfait = 0 et défaite 10-0
                    team1_points = result.winner === 1 ? 3 : result.winner === 0 ? 1 : 0;
                    team2_points = result.winner === 2 ? 3 : result.winner === 0 ? 1 : 0;

                    let newTeam1_score = team1_score as number;
                    let newTeam2_score = team2_score as number;

                    if (forfait) {
                        if (result.winner === 1) {
                            newTeam2_score = 0;
                            newTeam1_score = 10;
                        } else {
                            newTeam1_score = 0;
                            newTeam2_score = 10;
                        }
                    }
                    return { winner: result.winner, team1_points, team2_points, team1_score: newTeam1_score, team2_score: newTeam2_score };

                case 'basketball': //Victoire = 3, Nul = 2, Défaite = 1, Forfait = 0
                    team1_points = result.winner === 1 ? 3 : result.winner === 0 ? 2 : 1;
                    team2_points = result.winner === 2 ? 3 : result.winner === 0 ? 2 : 1;

                    if (forfait) {
                        if (result.winner === 1) {
                            team2_points = 0;
                        } else {
                            team1_points = 0;
                        }
                    }
                    return { winner: result.winner, team1_points, team2_points, team1_score, team2_score };

                case 'rugby': //Victoire = 4, Nul = 2, Défaite = 1, Forfait = 0
                    team1_points = result.winner === 1 ? 4 : result.winner === 0 ? 2 : 1;
                    team2_points = result.winner === 2 ? 4 : result.winner === 0 ? 2 : 1;

                    if (forfait) {
                        if (result.winner === 1) {
                            team2_points = 0;
                        } else {
                            team1_points = 0;
                        }
                    }
                    return { winner: result.winner, team1_points, team2_points, team1_score, team2_score };

                default:
                    console.error("giveResults - sport pas reconnu");
            }

        case 'volleyball':
        case 'badminton':
        case 'table_tennis':
            result = giveWinnerType2(team1_score as number[], team2_score as number[]);
            switch (sport_id) {
                case 'volleyball': //Victoire 2-0 = 3, Victoire 2-1 = 2, Défaite 2-1 = 1, Défaite 2-0 = 0
                    team1_points = result.winner === 1 ? (result.team1_score - result.team2_score === 2 ? 3 : 2) : result.team2_score - result.team1_score === 2 ? 0 : 1;
                    team2_points = result.winner === 2 ? (result.team2_score - result.team1_score === 2 ? 3 : 2) : result.team1_score - result.team2_score === 2 ? 0 : 1;
                    return { winner: result.winner, team1_points, team2_points, team1_score: result.team1_score, team2_score: result.team2_score };

                case 'badminton': //Nombre de victoires > confrontations directes > nombre de sets gagnés > nombre de points gagnés
                    return { winner: result.winner, team1_score: result.team1_score, team2_score: result.team2_score };

                case 'table_tennis': //Nombre de sets gagnés > confrontation directe
                    team1_points = result.winner === 1 ? 3 : result.winner === 0 ? 2 : 1;
                    team2_points = result.winner === 2 ? 3 : result.winner === 0 ? 2 : 1;
                    return { winner: result.winner, team1_score: result.team1_score, team2_score: result.team2_score };

                default:
                    console.error("giveResults - sport pas reconnu");
            }
        default:
            console.error("giveWinner - sport pas reconnu");
    }
};

type Team = {
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    wins?: number;
};

const sortTeams = (teams: Team[], sport_id: string): Team[] | void => {
    switch (sport_id) {
        case 'football':
        case 'handball':
        case 'rugby':
        case 'ultimate':
        case 'basketball':
        case 'volleyball': //On compte le nombre de points
            return teams.sort((team1, team2) => {
                if (team1.points !== team2.points) {
                    return team2.points - team1.points; // Sort by points in descending order
                } else {
                    return team2.goalsFor - team2.goalsAgainst - (team1.goalsFor - team1.goalsAgainst); // Sort by goal difference in descending order
                }
            });
        case 'badminton': //On compte le nombre de victoires
            return teams.sort((team1, team2) => {
                return (team2.wins || 0) - (team1.wins || 0);
            });
        case 'table_tennis': //On compte le nombre de sets gagnants
            return teams.sort((team1, team2) => {
                return team2.goalsFor - team1.goalsFor;
            });
        default:
            console.error("sortTeams - sport pas reconnu");
    }
};

const pointsPerMatchBySport = {
    FOOTBALL_M: {
        VICTORY: 3,
        DRAW: 1,
        DEFEAT: 0
    },
    FOOTBALL_F: {
        VICTORY: 3,
        DRAW: 1,
        DEFEAT: 0
    },
    BASKETBALL_M: {
        VICTORY: 3,
        DRAW: 2,
        DEFEAT: 1,
        FORFAIT: 0
    },
    BASKETBALL_F: {
        VICTORY: 3,
        DRAW: 2,
        DEFEAT: 1,
        FORFAIT: 0
    },
    HANDBALL: {
        VICTORY: 3,
        DRAW: 1,
        DEFEAT: 0
    },
    VOLLEYBALL_M: {
        VICTORY_2_0: 3,
        VICTORY_2_1: 2,
        DEFEAT_2_1: 1,
        DEFEAT_2_0: 0
    },
    VOLLEYBALL_F: {
        VICTORY_2_0: 3,
        VICTORY_2_1: 2,
        DEFEAT_2_1: 1,
        DEFEAT_2_0: 0
    },
    RUGBY_M: {
        VICTORY: 3,
        DRAW: 1,
        DEFEAT: 0
    },
    RELAY: {
        VICTORY: 0
    },
    CLIMBING: {
        VICTORY: 0
    },
    BADMINTON: {
        VICTORY: 0
    },
    ULTIMATE: {
        VICTORY: 3,
        DRAW: 1,
        DEFEAT: 0
    },
    TABLE_TENNIS: {
        VICTORY: 0
    }
};

export {
    giveResults,
    sortTeams,
};