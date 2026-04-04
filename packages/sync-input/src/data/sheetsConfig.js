/**
 * Google Sheets integration configuration for Sync Input.
 *
 * Setup instructions:
 * 1. Create a Google Sheet with one tab: "Notes"
 *    - Headers in row 1: "id", "content", "updatedAt"
 *
 * 2. Make the sheet publicly readable:
 *    Share → "Anyone with the link" → Viewer
 *
 * 3. Get a Google API key (or reuse an existing one):
 *    https://console.cloud.google.com/apis/credentials
 *    Enable "Google Sheets API" for your project
 *
 * 4. Deploy Google Apps Script for writes:
 *    Open the sheet → Extensions → Apps Script
 *    Paste the code from appscript.js.template
 *    Deploy → New deployment → Web app → Anyone can access
 *    Copy the deployment URL
 *
 * 5. Fill in the values below:
 */

// The spreadsheet ID from the Google Sheet URL:
// https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
export const SPREADSHEET_ID = "1YEdDKDYB-H15TrV4GAyjrLXiQ0X4ykWel12nCMW5vmQ";

// Your Google API key (for reading public sheets)
export const API_KEY = "AIzaSyCnpK1aiJn1Ll-0v5KWyHZVkwTVmSyn03s";

// The deployed Google Apps Script web app URL (for writes)
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPISHEt8X3C82xum_z4v2_LkyiVHc28JnCKnGX1EigJsa-zQJZo6oWZm1s8i4G358aSg/exec";

// Sheet tab name
export const NOTES_SHEET = "Notes";

// Whether Google Sheets integration is enabled
export const isGoogleSheetsEnabled = () =>
    Boolean(SPREADSHEET_ID && API_KEY && APPS_SCRIPT_URL);
