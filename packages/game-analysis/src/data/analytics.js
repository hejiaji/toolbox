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
                    scapegoatCount: 0,
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

            // Track MVP and scapegoat
            if (game.mvps && game.mvps.includes(p.name)) {
                stat.mvpCount += 1;
            }
            if (game.scapegoats && game.scapegoats.includes(p.name)) {
                stat.scapegoatCount = (stat.scapegoatCount || 0) + 1;
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
 * Filter games by year.
 * Returns games whose date starts with the given year string (e.g. "2026").
 * If year is null/undefined/"all", returns all games.
 */
export const filterGamesByYear = (games, year) => {
    if (!year || year === "all") return games;
    return games.filter((g) => g.date && g.date.startsWith(String(year)));
};

/**
 * Get available years from game data.
 * Returns sorted array of year strings, e.g. ["2025", "2026"].
 */
export const getAvailableYears = (games) => {
    const years = new Set();
    games.forEach((g) => {
        if (g.date && g.date.length >= 4) {
            years.add(g.date.slice(0, 4));
        }
    });
    return [...years].sort().reverse();
};

/**
 * Detailed stats for a single player across given games.
 * Returns:
 * {
 *   name, gamesPlayed, wins, losses, winRate, mvpCount,
 *   roles: { [roleKey]: count },
 *   roleWinRates: [{ roleKey, roleName, faction, played, wins, winRate }],
 *   wolfSideGames, wolfSideWins, wolfSideWinRate,
 *   villageSideGames, villageSideWins, villageSideWinRate,
 *   streak: { current, best },
 *   recentForm: ["W","L","W",...] (last 10 games),
 *   mvpRate,
 *   partners: [{ name, gamesPlayed, wins, winRate }] (teammates sorted by games)
 * }
 */
export const getPlayerDetailedStats = (games, playerName) => {
    const roleMap = {};      // roleKey -> { played, wins }
    const partnerMap = {};   // partnerName -> { gamesPlayed, wins }
    let wolfSideGames = 0, wolfSideWins = 0;
    let villageSideGames = 0, villageSideWins = 0;
    let standardGames = 0, standardWins = 0;
    let doubleIdGames = 0, doubleIdWins = 0;
    let mvpCount = 0, scapegoatCount = 0;
    let wins = 0, losses = 0;
    const results = []; // chronological W/L

    // Current and best win streak
    let currentStreak = 0, bestStreak = 0;

    // Sort games chronologically
    const sorted = [...games].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    sorted.forEach((game) => {
        const playerEntry = game.players.find((p) => p.name === playerName);
        if (!playerEntry) return;

        const isWolfWin = game.winner === WINNING_FACTIONS.WOLF;

        // Determine side
        let playerIsWolfSide;
        if (playerEntry.side) {
            playerIsWolfSide = playerEntry.side === "wolf";
        } else {
            const faction = getFactionForRole(playerEntry.role);
            const faction2 = playerEntry.role2 ? getFactionForRole(playerEntry.role2) : null;
            playerIsWolfSide = faction === FACTIONS.WOLF || faction2 === FACTIONS.WOLF;
        }

        const won = playerIsWolfSide === isWolfWin;

        if (won) {
            wins++;
            currentStreak++;
            if (currentStreak > bestStreak) bestStreak = currentStreak;
        } else {
            losses++;
            currentStreak = 0;
        }
        results.push(won ? "W" : "L");

        // Side stats
        if (playerIsWolfSide) {
            wolfSideGames++;
            if (won) wolfSideWins++;
        } else {
            villageSideGames++;
            if (won) villageSideWins++;
        }

        // Mode stats
        if (game.mode === "double_identity") {
            doubleIdGames++;
            if (won) doubleIdWins++;
        } else {
            standardGames++;
            if (won) standardWins++;
        }

        // MVP and scapegoat
        if (game.mvps && game.mvps.includes(playerName)) {
            mvpCount++;
        }
        if (game.scapegoats && game.scapegoats.includes(playerName)) {
            scapegoatCount++;
        }

        // Role tracking
        const roles = [playerEntry.role];
        if (playerEntry.role2) roles.push(playerEntry.role2);
        roles.forEach((r) => {
            if (!roleMap[r]) roleMap[r] = { played: 0, wins: 0 };
            roleMap[r].played++;
            if (won) roleMap[r].wins++;
        });

        // Partners (other players in the same game)
        game.players.forEach((other) => {
            if (other.name === playerName) return;
            if (!partnerMap[other.name]) partnerMap[other.name] = { gamesPlayed: 0, sameSide: 0, sameSideWins: 0 };
            partnerMap[other.name].gamesPlayed++;

            // Check if on the same side
            let otherIsWolfSide;
            if (other.side) {
                otherIsWolfSide = other.side === "wolf";
            } else {
                const oFaction = getFactionForRole(other.role);
                const oFaction2 = other.role2 ? getFactionForRole(other.role2) : null;
                otherIsWolfSide = oFaction === FACTIONS.WOLF || oFaction2 === FACTIONS.WOLF;
            }
            if (playerIsWolfSide === otherIsWolfSide) {
                partnerMap[other.name].sameSide++;
                if (won) partnerMap[other.name].sameSideWins++;
            }
        });
    });

    const gamesPlayed = wins + losses;

    const roleWinRates = Object.entries(roleMap)
        .map(([roleKey, { played, wins: rWins }]) => ({
            roleKey,
            played,
            wins: rWins,
            winRate: played > 0 ? rWins / played : 0,
        }))
        .sort((a, b) => b.played - a.played);

    const partners = Object.entries(partnerMap)
        .map(([name, { gamesPlayed: pg, sameSide, sameSideWins }]) => ({
            name,
            gamesPlayed: pg,
            sameSide,
            sameSideWins,
            sameSideWinRate: sameSide > 0 ? sameSideWins / sameSide : 0,
        }))
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .slice(0, 10);

    return {
        name: playerName,
        gamesPlayed,
        wins,
        losses,
        winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
        mvpCount,
        mvpRate: gamesPlayed > 0 ? mvpCount / gamesPlayed : 0,
        scapegoatCount,
        scapegoatRate: gamesPlayed > 0 ? scapegoatCount / gamesPlayed : 0,
        roles: roleMap,
        roleWinRates,
        wolfSideGames,
        wolfSideWins,
        wolfSideWinRate: wolfSideGames > 0 ? wolfSideWins / wolfSideGames : 0,
        villageSideGames,
        villageSideWins,
        villageSideWinRate: villageSideGames > 0 ? villageSideWins / villageSideGames : 0,
        streak: { current: currentStreak, best: bestStreak },
        recentForm: results.slice(-10),
        partners,
        standardGames,
        standardWins,
        standardWinRate: standardGames > 0 ? standardWins / standardGames : 0,
        doubleIdGames,
        doubleIdWins,
        doubleIdWinRate: doubleIdGames > 0 ? doubleIdWins / doubleIdGames : 0,
    };
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
