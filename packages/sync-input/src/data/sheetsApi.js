/**
 * Google Sheets API client for Sync Input.
 * Reads via Sheets API v4 (public sheet + API key).
 * Writes via a deployed Google Apps Script web app.
 */

import {
    SPREADSHEET_ID,
    API_KEY,
    APPS_SCRIPT_URL,
    NOTES_SHEET,
    isGoogleSheetsEnabled,
} from "./sheetsConfig";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/* ------------------------------------------------------------------ */
/*  Reading (Sheets API v4)                                            */
/* ------------------------------------------------------------------ */

/**
 * Fetch a note by ID from the Notes sheet.
 * Returns { noteValue, updatedAt } or { noteValue: "", updatedAt: null } if not found.
 */
export const fetchNote = async (noteId) => {
    if (!isGoogleSheetsEnabled()) {
        throw new Error("Google Sheets is not configured.");
    }

    const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(NOTES_SHEET)}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Sheets API error (${res.status}): ${await res.text()}`);
    }

    const json = await res.json();
    const rows = json.values || [];

    // Skip header, find row matching noteId
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === noteId) {
            return {
                noteValue: rows[i][1] || "",
                updatedAt: rows[i][2] || null,
            };
        }
    }

    return { noteValue: "", updatedAt: null };
};

/* ------------------------------------------------------------------ */
/*  Writing (Apps Script web app)                                      */
/* ------------------------------------------------------------------ */

/**
 * Send a write action to the Apps Script web app.
 */
const postAction = async (action, payload) => {
    if (!isGoogleSheetsEnabled()) {
        throw new Error("Google Sheets is not configured.");
    }

    const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
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

/**
 * Save (upsert) a note.
 * Returns { noteValue, updatedAt }.
 */
export const pushNote = async (noteId, noteValue) => {
    return postAction("saveNote", { id: noteId, content: noteValue });
};

/**
 * Delete a note by ID.
 */
export const deleteNote = async (noteId) => {
    return postAction("deleteNote", { id: noteId });
};
