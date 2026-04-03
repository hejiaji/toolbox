/**
 * Google Sheets integration configuration.
 *
 * Setup instructions:
 * 1. Create a Google Sheet with two tabs: "Players" and "Games"
 *    - Players tab: Column A header "name", then player names in rows below
 *    - Games tab: Headers in row 1: "id", "date", "winner", "players"
 *      Each game row: id, date string, "wolf"|"village", JSON string of players array
 *
 * 2. Make the sheet publicly readable:
 *    Share → "Anyone with the link" → Viewer
 *
 * 3. Get a Google API key:
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
export const SPREADSHEET_ID = "1NK6foS8YATx0iap90p8-faQOed2OmzPOuFQzB3C1smQ";

// Your Google API key (for reading public sheets)
export const API_KEY = "AIzaSyCnpK1aiJn1Ll-0v5KWyHZVkwTVmSyn03s";

// The deployed Google Apps Script web app URL (for writes)
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcqAzfmVw6AAo1jmpzqopJNf0BM6P1QqJLoSlVOvRr7To8QwV8AbTFju67u20ePPdx/exec";

// Sheet tab names
export const PLAYERS_SHEET = "Players";
export const GAMES_SHEET = "Games";
export const ROLES_SHEET = "Roles";

// Whether Google Sheets integration is enabled
// Returns true only when all required config values are set
export const isGoogleSheetsEnabled = () =>
    Boolean(SPREADSHEET_ID && API_KEY && APPS_SCRIPT_URL);
