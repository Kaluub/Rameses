//import CachedData from "./utils.js";
import EvadesData from "./evadesData.js";
import Config from "./config.js";
import { CachedData } from "./utils.js";

const sheetNames = {
    "Magnetic Monopole (28)": "Magnetic Monopole",
    "Magnetic Monopole Hard (28)": "Magnetic Monopole Hard",
    "Coupled Corridors: North": "Coupled Corridors",
    "Coupled Corridors: South": "Coupled Corridors",
}

function getAllRegionNamesAndAbbr() {
    let result = [];

    for (const region of EvadesData.regions) {
        if (!region.isInGame) continue;

        if (region.routes.length > 0) {
            for (const route of region.routes) {
                result.push({"name": route.name, "abbr": route.abbr });
            }
        }
        else {
            result.push({"name": region.name, "abbr": region.abbr });
        }
    }

    return result;
}

class RegionsData extends CachedData {
    constructor() {
        super();
        this.solo = {};
        this.duo = {};
    }

    saveSheetData(sheetData, isSolo, force = false) {
        if (!sheetData || isSolo === undefined) return;

        for (const region of getAllRegionNamesAndAbbr()) {
            region.name = RegionsData.convertRegionToSheetName(region.name);

            // Preventing repeats (e.g. CoCo)
            if (!force && this.solo[region.name] && isSolo) continue;
            if (!force && this.duo[region.name] && !isSolo) continue;

            const formattedRegion = RegionsData.parseRegion(region, sheetData);

            if (!formattedRegion) continue;

            if (isSolo)
                this.solo[region.name] = formattedRegion
            else
                this.duo[region.name] = formattedRegion;
        }
    }

    static convertRegionToSheetName(regionName) {
        return sheetNames[regionName] ? sheetNames[regionName] : regionName
    }

    static findRegionLocation(desiredRegion, sheetData, desiredAbbr = undefined) {
        for (let row = 0; row < sheetData.length; row++) {
            for (let col = 0; col < sheetData[row].length; col++) {
                if (sheetData[row][col].includes(desiredRegion)) return { "row": row, "col": col };

                if (desiredAbbr && sheetData[row][col + 3]) // In case of misspelling, using abbr
                    if (sheetData[row][col + 3] === desiredAbbr) return { "row": row, "col": col };
            }
        }

        return null;
    }

    static parseRegion(region, sheetData) {
        if (!region || !sheetData) return;

        const result = [];
        const { row, col } = RegionsData.findRegionLocation(region.name, sheetData, region?.abbr) ?? {};
        const offsets = {
            //name: [0,0]
            //abbr: [0,3]
            place: [2, 0],
            time: [2, 1],
            player: [2, 2],
            hero: [2, 3],
            area: [2, 4]
        };

        if (!row || !col) {
            if (Config.DEBUG) console.log(`Not found ${region.name}`)
            return;
        }

        for (let rank = 0; rank < 10; rank++) {
            const region = {};
            for (const [key, [rowOffset, colOffset]] of Object.entries(offsets))
                region[key] = sheetData[row + rowOffset + rank][col + colOffset] ?? '';

            // Leaderboard has not been filled
            if (!region.time || region.time === '') break;

            result.push(region);
        }

        return result;
    }
}

class HighScoresAPI {
    constructor() {
        this.fetchURL = `https://sheets.googleapis.com/v4/spreadsheets/1iNQsgPGu0xtSNyKEBDt8jr9EQfjD4Djn4e-qL7ljrRc/values/`;
        this.cache = null;
        this.regionCacheTime = 60 * 60 * 1000; // 1hr
        this.requestTimeout = 5 * 1000; // Timeout if no response in 5 seconds.

        this.resetCache();
    }

    resetCache() {
        this.cache = new RegionsData()
    }

    async get(range) {
        const url = this.fetchURL + `${encodeURIComponent(range)}` + `?key=${process.env.GOOGLE_API_KEY}`
        const controller = new AbortController();

        try {
            const timeoutId = setTimeout(() => { controller.abort() }, this.requestTimeout);
            
            if (Config.DEBUG)
                console.log(`> Fetched endpoint: ${encodeURI(this.fetchURL + range)}`);

            const data = await fetch(url, { signal: controller.signal }).catch();
            clearTimeout(timeoutId);
            if (!data?.ok) return null;
            return await data.json();
        }
        catch {
            return null;
        }
    }

    async getRegionScores(region, isSolo, force = false) {
        if (!region || isSolo === undefined) return;

        const regionData = this.cache;

        if (force || regionData.isOutdated(this.regionCacheTime)) {
            await this.fetchHighscores(true);
        }
        else if ((!regionData.solo && isSolo) || (!regionData.duo && !isSolo))
            await this.fetchHighscores(force); // regions has not been generated

        region = RegionsData.convertRegionToSheetName(region);

        return (isSolo) ? regionData.solo[region] : regionData.duo[region];
    }

    async fetchHighscores(force = false) {
        const regionsData = this.cache;

        const soloSheetData = await this.get("Solo");
        const duoSheetData = await this.get("Duo");

        if (!soloSheetData || !duoSheetData)
            if (Config.DEBUG) console.error("Google token is not provided or problem with sheet");

        regionsData.saveSheetData(soloSheetData.values, true, force);
        regionsData.saveSheetData(duoSheetData.values, false, force);
        regionsData.fetched = Date.now();
    }
}

export default HighScoresAPI;