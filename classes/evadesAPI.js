import { Collection, time } from "discord.js";
import fetch from "node-fetch";
import Changelog from "./changelog.js";
import { AccountData } from "./data.js";

class CachedData {
    constructor() {
        this.fetched = 0;
    }

    isOutdated(cacheLifetime) {
        return this.fetched + cacheLifetime < Date.now();
    }
}

class PlayerManager {
    constructor() {
        this.players = new Collection();
    }

    getPlayer(username) {
        return this.players.get(username.toLowerCase()) ?? null;
    }

    updatePlayer(username, data) {
        this.players.set(username.toLowerCase(), new PlayerDetailsData(data));
    }
}

class PlayerDetailsData extends CachedData {
    constructor(data) {
        super();
        this.stats = data?.stats ?? {};
        this.accessories = data?.accessories ?? {};
        this.calculateDetails();
    }

    calculateDetails() {
        let highestWeek = ["0", 0, null];
        let activeWeeks = 0;
        let summedCareerVP = 0;
        let firstActiveWeekNumber = null;
        let lastActiveWeekNumber = "0";
        for(const weekNumber in this.stats["week_record"]) {
            const week = this.stats["week_record"][weekNumber];
            activeWeeks += 1;
            summedCareerVP += week["wins"];
            lastActiveWeekNumber = weekNumber;
            if(!firstActiveWeekNumber) firstActiveWeekNumber = weekNumber;
            if(week["wins"] > highestWeek[1])
                highestWeek = [weekNumber, week["wins"], week["finish"]];
        }

        this.highestWeek = highestWeek;
        this.activeWeeks = activeWeeks;
        this.summedCareerVP = summedCareerVP;
        this.firstActiveWeekNumber = firstActiveWeekNumber;
        this.lastActiveWeekNumber = lastActiveWeekNumber;
    }
}

class OnlinePlayersData extends CachedData {
    constructor() {
        super();
        this.players = [];
    }
}

class HallOfFameData extends CachedData {
    constructor() {
        super();
        this.entries = [];
    }
}

class EvadesAPI {
    constructor() {
        this.fetchURL = "https://evades.io/api/"
        this.cache = null;
        this.playerDetailsCacheTime = 300000;
        this.onlinePlayersCacheTime = 10000;
        this.hallOfFameCacheTime = 60000;
        this.requestTimeout = 5000;
        this.resetCache();
        updateLastSeen(this);
        setInterval(updateLastSeen, this.onlinePlayersCacheTime, this);
    }

    resetCache() {
        this.cache = {
            playerManager: new PlayerManager(),
            onlinePlayers: new OnlinePlayersData(),
            hallOfFame: new HallOfFameData()
        }
    }

    async get(endpoint) {
        const controller = new AbortController();
        try {
            const timeoutId = setTimeout(() => { controller.abort() }, this.requestTimeout);
            const data = await fetch(this.fetchURL + endpoint, { signal: controller.signal }).catch();
            clearTimeout(timeoutId);
            if(!data || !data.ok) return null;
            return await data.json();
        }
        catch {
            return null;
        }
    }

    async getPlayerDetails(username, force = false) {
        if(force || !this.cache.playerManager.getPlayer(username) || this.cache.playerManager.getPlayer(username).isOutdated(this.hallOfFameCacheTime)) {
            const playerDetails = await this.get("account/" + username);
            if(!playerDetails) return null;
            this.cache.playerManager.updatePlayer(username, playerDetails);
        }
        return this.cache.playerManager.getPlayer(username);
    }

    async getOnlinePlayers(force = false) {
        if(force || this.cache.onlinePlayers.isOutdated(this.onlinePlayersCacheTime)) {
            const rawPlayers = await this.get("game/usernames");
            if(!rawPlayers) return null;
            const players = [];
            for(const displayName of rawPlayers) {
                const username = displayName.toLowerCase()
                if(username.startsWith("guest")) {
                    players.push(displayName);
                    continue;
                }
                let account = await AccountData.getByUsername(username);
                if(!account.displayName) {
                    account.displayName = displayName;
                    await account.save()
                }
                players.push(displayName);
            }
            this.cache.onlinePlayers.players = players;
            this.cache.onlinePlayers.fetched = Date.now();
        }
        return this.cache.onlinePlayers.players;
    }

    async getHallOfFame(force = false) {
        if(force || this.cache.hallOfFame.isOutdated(this.hallOfFameCacheTime)) {
            const hallOfFame = await this.get("game/hall_of_fame");
            if(!hallOfFame) return null;
            this.cache.hallOfFame.entries = hallOfFame.players;
            this.cache.hallOfFame.fetched = Date.now();
        }
        return this.cache.hallOfFame.entries;
    }
}

let failedToConnect = true;
async function updateLastSeen(evadesAPI) {
    const onlinePlayers = await evadesAPI.getOnlinePlayers();

    if(!onlinePlayers) {
        failedToConnect = true;
        return;
    } else if(failedToConnect) {
        // Fetch changelog after being unable to connect.
        failedToConnect = false;
        await Changelog.updateChangelog();
    }

    const hour = new Date().getUTCHours().toString();
    for(const username of onlinePlayers) {
        if(username.startsWith("Guest")) continue;
        AccountData.getByUsername(username).then((account) => {
            // Collect data regarding active times.
            account.lastSeen = Math.floor(Date.now() / 1000);
            if(!account.activity[hour]) account.activity[hour] = 0;
            account.activity[hour] += 1;
            account.playTime += Math.floor(evadesAPI.onlinePlayersCacheTime / 1000);
            account.save();
        });
    }
}

export default EvadesAPI;