/**
 * Google Sheets API client.
 * Reads via Sheets API v4 (public sheet + API key).
 * Writes via a deployed Google Apps Script web app.
 */

import {
    SPREADSHEET_ID,
    API_KEY,
    APPS_SCRIPT_URL,
    PLAYERS_SHEET,
    GAMES_SHEET,
    ROLES_SHEET,
    isGoogleSheetsEnabled,
} from "./sheetsConfig";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/* ------------------------------------------------------------------ */
/*  Reading (Sheets API v4)                                            */
/* ------------------------------------------------------------------ */

/**
 * Fetch raw values from a sheet tab.
 * Returns a 2D array of strings, e.g. [["id","date","winner","players"], ["g_1",...]].
 */
const fetchSheetValues = async (sheetName) => {
    const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Sheets API error (${res.status}): ${await res.text()}`);
    }
    const json = await res.json();
    return json.values || [];
};

/**
 * Fetch all players from the Players sheet.
 * Returns an array of player name strings.
 */
export const fetchPlayers = async () => {
    const rows = await fetchSheetValues(PLAYERS_SHEET);
    // Skip header row, take column A
    return rows.slice(1).map((row) => row[0]).filter(Boolean);
};

/**
 * Fetch all games from the Games sheet.
 * Returns an array of game objects matching our data shape.
 */
export const fetchGames = async () => {
    const rows = await fetchSheetValues(GAMES_SHEET);
    if (rows.length <= 1) return []; // empty or header only

    // Header: id, date, winner, players
    return rows.slice(1).map((row) => {
        let players = [];
        try {
            players = JSON.parse(row[3] || "[]");
        } catch {
            players = [];
        }
        return {
            id: row[0] || "",
            date: row[1] || "",
            winner: row[2] || "",
            players,
        };
    });
};

/**
 * Fetch all custom roles from the Roles sheet.
 * Returns an array of { key, name, faction }.
 */
export const fetchCustomRoles = async () => {
    const rows = await fetchSheetValues(ROLES_SHEET);
    if (rows.length <= 1) return [];

    // Header: key, name, faction
    return rows.slice(1).map((row) => ({
        key: row[0] || "",
        name: row[1] || "",
        faction: row[2] || "villager",
    })).filter((r) => r.key && r.name);
};

/**
 * Fetch complete data from Google Sheets.
 * Returns { players: string[], games: Game[], customRoles: Role[] }.
 */
export const fetchAllData = async () => {
    if (!isGoogleSheetsEnabled()) {
        return null;
    }

    const [players, games, customRoles] = await Promise.all([
        fetchPlayers(),
        fetchGames(),
        fetchCustomRoles().catch(() => []), // graceful fallback if Roles tab doesn't exist yet
    ]);
    return { players, games, customRoles };
};

/* ------------------------------------------------------------------ */
/*  Writing (Apps Script web app)                                      */
/* ------------------------------------------------------------------ */

/**
 * Send a write action to the Apps Script web app.
 * The script handles the actual sheet mutation.
 *
 * @param {string} action - One of: "addPlayer", "removePlayer", "addGame", "deleteGame"
 * @param {object} payload - Action-specific data
 */
const postAction = async (action, payload) => {
    if (!isGoogleSheetsEnabled()) {
        throw new Error("Google Sheets is not configured.");
    }

    const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // Apps Script CORS workaround
        body: JSON.stringify({ action, ...payload }),
    });

    if (!res.ok) {
        throw new Error(`Apps Script error (${res.status}): ${await res.text()}`);
    }

    const json = await res.json();
    if (json.error) {
        throw new Error(json.error);
    }
    return json;
};

/* ---- Player actions ---- */

export const sheetAddPlayer = (name) =>
    postAction("addPlayer", { name });

export const sheetRemovePlayer = (name) =>
    postAction("removePlayer", { name });

/* ---- Game actions ---- */

export const sheetAddGame = (game) =>
    postAction("addGame", {
        id: game.id,
        date: game.date,
        winner: game.winner,
        players: JSON.stringify(game.players),
    });

export const sheetDeleteGame = (gameId) =>
    postAction("deleteGame", { id: gameId });

/* ---- Role actions ---- */

export const sheetAddRole = (role) =>
    postAction("addRole", {
        key: role.key,
        name: role.name,
        faction: role.faction,
    });

export const sheetRemoveRole = (roleKey) =>
    postAction("removeRole", { key: roleKey });

/* ---- Bulk import ---- */

export const sheetImportData = (data) =>
    postAction("importData", {
        players: data.players,
        games: data.games.map((g) => ({
            id: g.id,
            date: g.date,
            winner: g.winner,
            players: JSON.stringify(g.players),
        })),
        customRoles: (data.customRoles || []).map((r) => ({
            key: r.key,
            name: r.name,
            faction: r.faction,
        })),
    });
