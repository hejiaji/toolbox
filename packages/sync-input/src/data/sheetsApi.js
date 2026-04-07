/**
 * Google Sheets API client for Sync Input.
 * Reads via Sheets API v4 (public sheet + API key).
 * Writes via a deployed Google Apps Script web app.
 */

import {
    APPS_SCRIPT_URL,
    isGoogleSheetsEnabled,
} from "./sheetsConfig";

/* ------------------------------------------------------------------ */
/*  Reading (Sheets API v4)                                            */
/* ------------------------------------------------------------------ */

/**
 * Fetch a note by ID.
 * Uses Apps Script (not the Sheets API) to avoid Google's public-read cache,
 * which can be stale for several minutes — unacceptable for real-time sync.
 * Returns { noteValue, updatedAt } or { noteValue: "", updatedAt: null } if not found.
 */
export const fetchNote = async (noteId) => {
    if (!isGoogleSheetsEnabled()) {
        throw new Error("Google Sheets is not configured.");
    }

    const url = `${APPS_SCRIPT_URL}?action=getNote&id=${encodeURIComponent(noteId)}&_t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Apps Script error (${res.status}): ${await res.text()}`);
    }

    const json = await res.json();
    return {
        noteValue: json.noteValue ?? json.content ?? "",
        updatedAt: json.updatedAt || null,
    };
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
