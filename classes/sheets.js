import { GoogleSpreadsheet } from "google-spreadsheet";
import Config from "./config.js";

class Sheets {
    constructor(sheetId) {
        if (!Config.GOOGLE_API_ENABLED)
            throw new Error("Google API is disabled while a Sheets instance is being created!");
        
        if (!Config.GOOGLE_PRIVATE_KEY || !Config.GOOGLE_SERVICE_EMAIL)
            throw new Error("Sheets required GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_EMAIL to be set in config! Set GOOGLE_API_ENABLED to false to ignore.");
        
        this.sheetId = sheetId;
        this.cachedResults = new Map();
        this.cachedTime = 0;
        this.cacheLifetime = 15000;
        this.setup();
    }

    async setup() {
        this.doc = new GoogleSpreadsheet(this.sheetId);
        await this.doc.useServiceAccountAuth({
            client_email: Config.GOOGLE_SERVICE_EMAIL,
            private_key: Config.GOOGLE_PRIVATE_KEY
        });
        await this.doc.loadInfo();
        this.eloSheet = this.doc.sheetsById["582153053"];
    }

    async getELOData() {
        if (!this.doc || !this.eloSheet) return null;
        if (this.cachedTime + this.cacheLifetime > Date.now()) return this.cachedResults;
        await this.eloSheet.loadCells("D2:E");
        this.cachedResults.clear();
        for (let i = 1; i <= Math.ceil(this.eloSheet.cellStats.nonEmpty / 2); i++) {
            const username = this.eloSheet.getCell(i, 3);
            const elo = this.eloSheet.getCell(i, 4);
            this.cachedResults.set(username.value, Math.round(elo.value));
        }
        this.cachedTime = Date.now();
        return this.cachedResults;
    }
}

export default Sheets;