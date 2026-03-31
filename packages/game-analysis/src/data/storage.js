/**
 * JSON-based data storage using localStorage.
 * Provides read/write/export/import for werewolf game records.
 *
 * Data shape:
 * {
 *   players: ["Alice", "Bob", ...],
 *   games: [
 *     {
 *       id: "g_1234567890",
 *       date: "2026-03-31",
 *       winner: "wolf" | "village",
 *       players: [
 *         { name: "Alice", role: "seer", alive: false },
 *         { name: "Bob", role: "werewolf", alive: true },
 *         ...
 *       ]
 *     }
 *   ]
 * }
 */

const STORAGE_KEY = "werewolf_game_data";

const defaultData = () => ({
    players: [],
    games: [],
});

/** Read entire dataset from localStorage */
export const loadData = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultData();
        const parsed = JSON.parse(raw);
        return { ...defaultData(), ...parsed };
    } catch {
        return defaultData();
    }
};

/** Write entire dataset to localStorage */
export const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/** Add a new player name (deduped) */
export const addPlayer = (name) => {
    const data = loadData();
    const trimmed = name.trim();
    if (trimmed && !data.players.includes(trimmed)) {
        data.players.push(trimmed);
        saveData(data);
    }
    return data;
};

/** Remove a player by name */
export const removePlayer = (name) => {
    const data = loadData();
    data.players = data.players.filter((p) => p !== name);
    saveData(data);
    return data;
};

/** Add a game record */
export const addGame = (game) => {
    const data = loadData();
    const record = {
        ...game,
        id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    data.games.push(record);

    // Auto-register any new player names from this game
    record.players.forEach((p) => {
        if (!data.players.includes(p.name)) {
            data.players.push(p.name);
        }
    });

    saveData(data);
    return data;
};

/** Delete a game record by id */
export const deleteGame = (gameId) => {
    const data = loadData();
    data.games = data.games.filter((g) => g.id !== gameId);
    saveData(data);
    return data;
};

/** Export data as a JSON string (for file download) */
export const exportData = () => {
    return JSON.stringify(loadData(), null, 2);
};

/** Import data from a JSON string (merges with existing) */
export const importData = (jsonString) => {
    const incoming = JSON.parse(jsonString);
    const current = loadData();

    // Merge players (dedupe)
    const allPlayers = [...new Set([...current.players, ...(incoming.players || [])])];

    // Merge games (dedupe by id)
    const existingIds = new Set(current.games.map((g) => g.id));
    const newGames = (incoming.games || []).filter((g) => !existingIds.has(g.id));
    const allGames = [...current.games, ...newGames];

    const merged = { players: allPlayers, games: allGames };
    saveData(merged);
    return merged;
};

/** Replace all data (for full import/overwrite) */
export const replaceData = (data) => {
    saveData(data);
    return data;
};
