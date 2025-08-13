import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID as string;
if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_ID not set');

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');

const credentials = JSON.parse(serviceAccountJson);
const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: SCOPES
});
const sheetsApi = google.sheets({ version: 'v4', auth });

const USERS_SHEET = 'users';
const ACHIEVEMENTS_SHEET = 'achievements';

// READ-ONLY + EXPORT
export const sheets = {
  async getAllUsers(): Promise<any[]> {
    const res = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A2:L`
    });
    return res.data.values || [];
  },

  async getUserAchievements(userId: string) {
    const res = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ACHIEVEMENTS_SHEET}!A2:F`
    });
    const rows = res.data.values || [];
    return rows
      .filter(r => r[0] === userId)
      .map(r => ({
        user_id: r[0],
        tier: r[1] as 'bronze' | 'silver' | 'gold',
        title: r[2],
        description: r[3],
        unlocked_at: r[4],
        superseded: r[5] === 'TRUE'
      }));
  },

  async getAllAchievements() {
    const res = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ACHIEVEMENTS_SHEET}!A2:F`
    });
    return res.data.values || [];
  },

  async exportUsers(usersRows: any[][]) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A2:L`,
      valueInputOption: 'RAW',
      requestBody: { values: usersRows }
    });
  },

  async exportAchievements(achRows: any[][]) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ACHIEVEMENTS_SHEET}!A2:F`,
      valueInputOption: 'RAW',
      requestBody: { values: achRows }
    });
  }
};
