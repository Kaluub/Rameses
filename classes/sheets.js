import { readFileSync, writeFileSync } from "fs";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { readJSON } from "../utils.js";

class Sheets {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
        this.cachedResults = null;
        this.cachedTime = 0;
        this.cacheLifetime = 10000;
        this.authorize();
    }

    async authorize() {
        try {
            this.auth = google.auth.fromJSON(JSON.parse(readFileSync("./secrets/googletoken.json")));
            this.sheets = google.sheets({ version: "v4", auth: this.auth });
            return;
        } catch { };
        try {
            this.auth = await authenticate({ scopes: this.scopes, keyfilePath: "C:\\Users\\Kaleb\\Documents\\Programming\\JS\\Discord.js\\Rameses\\secrets\\googlecredentials.json" });
            this.sheets = google.sheets({ version: "v4", auth: this.auth });
            const keys = readJSON("./secrets/googlecredentials.json");
            const key = keys.installed || keys.web;
            writeFileSync("./secrets/googletoken.json", JSON.stringify({
                "type": "authorized_user",
                "client_id": key.client_id,
                "client_secret": key.client_secret,
                "refresh_token": this.auth.credentials.refresh_token
            }));
        } catch (err) {
            console.error(err);
        }
    }

    async getELOData() {
        if(!this.auth) return null;
        if(this.cachedTime + this.cacheLifetime > Date.now()) return this.cachedResults;
        const result = await this.sheets?.spreadsheets.values.get({
            spreadsheetId: "18QTGlPn8WI5NfymccFV2m1duPcbUFahWtY22Qc5gc3g",
            range: "Leaderboard!D2:E",
            majorDimension: "ROWS"
        });
        if(result.status !== 200) return null;
        this.cachedResults = result.data.values;
        this.cachedTime = Date.now();
        return this.cachedResults;
    }
}

export default Sheets;