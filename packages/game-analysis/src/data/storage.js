/**
 * Data storage layer — localStorage cache + optional Google Sheets sync.
 *
 * When Google Sheets is configured, all writes go to both localStorage (instant)
 * and Google Sheets (async). Reads can pull fresh data from Sheets on demand.
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
 *       ]
 *     }
 *   ]
 * }
 */

import { isGoogleSheetsEnabled } from "./sheetsConfig";
import {
    fetchAllData,
    sheetAddPlayer,
    sheetRemovePlayer,
    sheetAddGame,
    sheetDeleteGame,
    sheetAddRole,
    sheetRemoveRole,
    sheetImportData,
} from "./sheetsApi";

const STORAGE_KEY = "werewolf_game_data";
const DELETED_IDS_KEY = "werewolf_deleted_ids";
const RETRY_QUEUE_KEY = "werewolf_retry_queue";

const defaultData = () => ({
    players: [],
    games: [],
    customRoles: [],
});

/* ------------------------------------------------------------------ */
/*  Local storage (synchronous cache)                                  */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Deletion tracking                                                  */
/* ------------------------------------------------------------------ */

const loadDeletedIds = () => {
    try {
        return new Set(JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || "[]"));
    } catch { return new Set(); }
};

const saveDeletedIds = (ids) => {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...ids]));
};

const markAsDeleted = (gameId) => {
    const ids = loadDeletedIds();
    ids.add(gameId);
    saveDeletedIds(ids);
};

const unmarkDeleted = (gameId) => {
    const ids = loadDeletedIds();
    ids.delete(gameId);
    saveDeletedIds(ids);
};

/* ------------------------------------------------------------------ */
/*  Retry queue for failed background syncs                            */
/* ------------------------------------------------------------------ */

const loadRetryQueue = () => {
    try {
        return JSON.parse(localStorage.getItem(RETRY_QUEUE_KEY) || "[]");
    } catch { return []; }
};

const saveRetryQueue = (queue) => {
    localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(queue));
};

const addToRetryQueue = (action) => {
    const queue = loadRetryQueue();
    queue.push({ ...action, timestamp: Date.now() });
    saveRetryQueue(queue);
};

const processRetryQueue = async () => {
    const queue = loadRetryQueue();
    if (queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
        try {
            switch (item.type) {
                case "deleteGame":
                    await sheetDeleteGame(item.gameId);
                    unmarkDeleted(item.gameId);
                    break;
                case "addGame":
                    await sheetAddGame(item.game);
                    break;
                case "addPlayer":
                    await sheetAddPlayer(item.name);
                    break;
                case "removePlayer":
                    await sheetRemovePlayer(item.name);
                    break;
                case "addRole":
                    await sheetAddRole(item.role);
                    break;
                case "removeRole":
                    await sheetRemoveRole(item.roleKey);
                    break;
                default:
                    break;
            }
        } catch {
            // Keep in queue if less than 7 days old
            if (Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000) {
                remaining.push(item);
            }
        }
    }
    saveRetryQueue(remaining);
};

/* ------------------------------------------------------------------ */
/*  Google Sheets sync                                                 */
/* ------------------------------------------------------------------ */

/**
 * Fetch fresh data from Google Sheets and merge with localStorage cache.
 * Merging ensures any local writes that haven't synced yet are preserved.
 * Returns the merged data, or falls back to localStorage if Sheets is not configured.
 */
export const syncFromSheets = async () => {
    if (!isGoogleSheetsEnabled()) {
        return loadData();
    }

    // Process any pending retries first
    await processRetryQueue().catch(() => {});

    try {
        const remote = await fetchAllData();
        if (remote) {
            const local = loadData();
            const deletedIds = loadDeletedIds();

            // Merge players (union)
            const allPlayers = [...new Set([
                ...(remote.players || []),
                ...(local.players || []),
            ])];

            // Merge games (union by id, merge fields for duplicates)
            // Filter out any games that were locally deleted
            const localGameMap = new Map((local.games || []).map((g) => [g.id, g]));
            const mergedGameIds = new Set();
            const mergedGames = (remote.games || [])
                .filter((rg) => !deletedIds.has(rg.id))
                .map((rg) => {
                    mergedGameIds.add(rg.id);
                    const lg = localGameMap.get(rg.id);
                    if (lg) {
                        return { ...lg, ...rg, mvps: rg.mvps && rg.mvps.length > 0 ? rg.mvps : (lg.mvps || []), scapegoats: rg.scapegoats && rg.scapegoats.length > 0 ? rg.scapegoats : (lg.scapegoats || []), mode: rg.mode || lg.mode };
                    }
                    return rg;
                });
            // Only keep local-only games that were created very recently (< 60s ago)
            // This preserves games just recorded (background sync hasn't completed)
            // but drops stale local data that was deleted from Sheets
            const now = Date.now();
            const localOnlyGames = (local.games || []).filter((g) => {
                if (mergedGameIds.has(g.id) || deletedIds.has(g.id)) return false;
                // Parse creation timestamp from id (format: g_{timestamp}_xxxxx)
                const match = g.id && g.id.match(/^g_(\d+)_/);
                if (match) {
                    const createdAt = parseInt(match[1], 10);
                    return (now - createdAt) < 60000; // keep if < 60 seconds old
                }
                return false; // drop unknown format games not on remote
            });
            const allGames = [...mergedGames, ...localOnlyGames];

            // Merge custom roles (union by key, local wins on conflict)
            const remoteRoleKeys = new Set((remote.customRoles || []).map((r) => r.key));
            const localOnlyRoles = (local.customRoles || []).filter((r) => !remoteRoleKeys.has(r.key));
            const allRoles = [...(remote.customRoles || []), ...localOnlyRoles];

            const merged = {
                players: allPlayers,
                games: allGames,
                customRoles: allRoles,
            };
            saveData(merged);
            return merged;
        }
    } catch (err) {
        console.warn("Failed to sync from Google Sheets, using local cache:", err);
    }
    return loadData();
};

/**
 * Fire-and-forget helper for background sheet writes.
 * Logs errors but does not throw, so the UI stays responsive.
 */
const backgroundSync = (asyncFn) => {
    if (!isGoogleSheetsEnabled()) return;
    asyncFn().catch((err) => {
        console.warn("Google Sheets background sync failed:", err);
    });
};

/* ------------------------------------------------------------------ */
/*  Data mutation functions (write local + sync to Sheets)             */
/* ------------------------------------------------------------------ */

/** Add a new player name (deduped) */
export const addPlayer = (name) => {
    const data = loadData();
    const trimmed = name.trim();
    if (trimmed && !data.players.includes(trimmed)) {
        data.players.push(trimmed);
        saveData(data);
        backgroundSync(() => sheetAddPlayer(trimmed));
    }
    return data;
};

/** Add a custom role { key, name, faction } */
export const addRole = (role) => {
    const data = loadData();
    if (!role.key || data.customRoles.some((r) => r.key === role.key)) return data;
    data.customRoles.push(role);
    saveData(data);
    backgroundSync(() => sheetAddRole(role));
    return data;
};

/** Remove a custom role by key */
export const removeRole = (roleKey) => {
    const data = loadData();
    data.customRoles = data.customRoles.filter((r) => r.key !== roleKey);
    saveData(data);
    backgroundSync(() => sheetRemoveRole(roleKey));
    return data;
};

/** Remove a player by name */
export const removePlayer = (name) => {
    const data = loadData();
    data.players = data.players.filter((p) => p !== name);
    saveData(data);
    backgroundSync(() => sheetRemovePlayer(name));
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
    const newPlayers = [];
    record.players.forEach((p) => {
        if (!data.players.includes(p.name)) {
            data.players.push(p.name);
            newPlayers.push(p.name);
        }
    });

    saveData(data);

    // Sync to Sheets: add game + any new players
    backgroundSync(async () => {
        await sheetAddGame(record);
        for (const name of newPlayers) {
            await sheetAddPlayer(name);
        }
    });

    return data;
};

/** Update a game record by id */
export const updateGame = (gameId, updates) => {
    const data = loadData();
    const idx = data.games.findIndex((g) => g.id === gameId);
    if (idx === -1) return data;
    data.games[idx] = { ...data.games[idx], ...updates };
    saveData(data);
    // Re-sync to sheets: delete old + add updated
    backgroundSync(async () => {
        await sheetDeleteGame(gameId);
        await sheetAddGame(data.games[idx]);
    });
    return data;
};

/** Delete a game record by id */
export const deleteGame = (gameId) => {
    const data = loadData();
    data.games = data.games.filter((g) => g.id !== gameId);
    saveData(data);
    markAsDeleted(gameId);
    backgroundSync(async () => {
        try {
            await sheetDeleteGame(gameId);
            unmarkDeleted(gameId);
        } catch (err) {
            addToRetryQueue({ type: "deleteGame", gameId });
            throw err;
        }
    });
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

    // Sync merged data to Sheets
    backgroundSync(() => sheetImportData(merged));

    return merged;
};

/** Replace all data (for full import/overwrite) */
export const replaceData = (data) => {
    saveData(data);
    backgroundSync(() => sheetImportData(data));
    return data;
};
