/**
 * Analytics utilities — pure functions that derive stats from game data.
 */

import { getFactionForRole, FACTIONS, WINNING_FACTIONS } from "../constants/roles";

/**
 * Overall win rate by faction.
 * Returns { wolf: { wins, total, rate }, village: { wins, total, rate } }
 */
export const getOverallWinRate = (games) => {
    const total = games.length;
    if (total === 0) return null;

    const wolfWins = games.filter((g) => g.winner === WINNING_FACTIONS.WOLF).length;
    const villageWins = total - wolfWins;

    return {
        wolf: { wins: wolfWins, total, rate: wolfWins / total },
        village: { wins: villageWins, total, rate: villageWins / total },
    };
};

/**
 * Per-player stats.
 * Returns an array of { name, gamesPlayed, wins, losses, winRate, roles: { [roleKey]: count } }
 */
export const getPlayerStats = (games) => {
    const map = {};

    games.forEach((game) => {
        const isWolfWin = game.winner === WINNING_FACTIONS.WOLF;

        game.players.forEach((p) => {
            if (!map[p.name]) {
                map[p.name] = {
                    name: p.name,
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    mvpCount: 0,
                    roles: {},
                };
            }
            const stat = map[p.name];
            stat.gamesPlayed += 1;

            // Determine which side the player is on
            // If player has a side override (e.g. 混血儿), use that
            let playerIsWolfSide;
            if (p.side) {
                playerIsWolfSide = p.side === "wolf";
            } else {
                const faction = getFactionForRole(p.role);
                const faction2 = p.role2 ? getFactionForRole(p.role2) : null;
                playerIsWolfSide = faction === FACTIONS.WOLF || faction2 === FACTIONS.WOLF;
            }
            const won = playerIsWolfSide === isWolfWin;

            if (won) {
                stat.wins += 1;
            } else {
                stat.losses += 1;
            }

            // Track MVP
            if (game.mvps && game.mvps.includes(p.name)) {
                stat.mvpCount += 1;
            }

            // Track both roles
            stat.roles[p.role] = (stat.roles[p.role] || 0) + 1;
            if (p.role2) {
                stat.roles[p.role2] = (stat.roles[p.role2] || 0) + 1;
            }
        });
    });

    return Object.values(map)
        .map((s) => ({
            ...s,
            winRate: s.gamesPlayed > 0 ? s.wins / s.gamesPlayed : 0,
        }))
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.winRate - a.winRate);
};

/**
 * Per-role stats.
 * Returns an array of { roleKey, timesPlayed, wins, winRate }
 */
export const getRoleStats = (games) => {
    const map = {};

    games.forEach((game) => {
        const isWolfWin = game.winner === WINNING_FACTIONS.WOLF;

        game.players.forEach((p) => {
            // Collect all roles this player had (1 or 2 in double-identity)
            const roles = [p.role];
            if (p.role2) roles.push(p.role2);

            // Determine win: use side override if present, otherwise check role factions
            let playerIsWolfSide;
            if (p.side) {
                playerIsWolfSide = p.side === "wolf";
            } else {
                playerIsWolfSide = roles.some(
                    (r) => getFactionForRole(r) === FACTIONS.WOLF
                );
            }
            const won = playerIsWolfSide === isWolfWin;

            roles.forEach((role) => {
                if (!map[role]) {
                    map[role] = { roleKey: role, timesPlayed: 0, wins: 0 };
                }
                const stat = map[role];
                stat.timesPlayed += 1;

                if (won) {
                    stat.wins += 1;
                }
            });
        });
    });

    return Object.values(map)
        .map((s) => ({
            ...s,
            winRate: s.timesPlayed > 0 ? s.wins / s.timesPlayed : 0,
        }))
        .sort((a, b) => b.timesPlayed - a.timesPlayed);
};

/**
 * Game history formatted for display.
 */
export const getGameHistory = (games) => {
    return [...games].sort((a, b) => {
        // Sort newest first
        if (a.date && b.date) return b.date.localeCompare(a.date);
        return 0;
    });
};
