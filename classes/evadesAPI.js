import { Collection } from "discord.js";
import fetch from "node-fetch";
import Config from "./config.js";
import Changelog from "./gameChangelog.js";
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
        this.createdAt = data?.created_at ?? Date.now() / 1000;
        this.calculateDetails();
    }

    calculateDetails() {
        let highestWeek = ["0", 0, null];
        let activeWeeks = 0;
        let summedCareerVP = this.stats["highest_area_achieved_resettable_counter"];
        let firstActiveWeekNumber = null;
        let lastActiveWeekNumber = "0";

        for (const weekNumber in this.stats["week_record"]) {
            const week = this.stats["week_record"][weekNumber];
            activeWeeks += 1;
            summedCareerVP += parseInt(week["wins"]) || 0;
            lastActiveWeekNumber = weekNumber;
            if (!firstActiveWeekNumber) firstActiveWeekNumber = weekNumber;
            if ((week["wins"] ?? 0) > highestWeek[1])
                highestWeek = [weekNumber, parseInt(week["wins"]) || 0, week["finish"]];
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

class ServerStatsData extends CachedData {
    constructor() {
        super();
        this.localServers = [];
        this.remoteServers = [];
        this.connected = 0;
        this.capacity = 0;
        this.autoConnect = false;
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
        this.serverStatsCacheTime = 10000;
        this.hallOfFameCacheTime = 60000;
        this.requestTimeout = 5000; // Timeout if no response in 5 seconds.
        this.resetCache();
        updateLastSeen(this);
        updateCareerVP(this);
        setInterval(updateLastSeen, this.onlinePlayersCacheTime, this);
        setInterval(updateCareerVP, 600000, this); // Updates every 10 minutes.
    }

    resetCache() {
        this.cache = {
            playerManager: new PlayerManager(),
            onlinePlayers: new OnlinePlayersData(),
            serverStats: new ServerStatsData(),
            hallOfFame: new HallOfFameData()
        }
    }

    async get(endpoint) {
        const controller = new AbortController();
        try {
            const timeoutId = setTimeout(() => { controller.abort() }, this.requestTimeout);
            if (Config.DEBUG) console.log(`> Fetched endpoint: ${encodeURI(this.fetchURL + endpoint)}`)
            const data = await fetch(this.fetchURL + endpoint, { signal: controller.signal }).catch();
            clearTimeout(timeoutId);
            if (!data || !data.ok) return null;
            return await data.json();
        }
        catch {
            return null;
        }
    }

    async getPlayerDetails(username, force = false) {
        if (force || !this.cache.playerManager.getPlayer(username) || this.cache.playerManager.getPlayer(username).isOutdated(this.playerDetailsCacheTime)) {
            const playerDetails = await this.get("account/" + encodeURIComponent(username));
            if (!playerDetails) return null;
            this.cache.playerManager.updatePlayer(username, playerDetails);
        }
        return this.cache.playerManager.getPlayer(username);
    }

    async getOnlinePlayers(force = false) {
        if (force || this.cache.onlinePlayers.isOutdated(this.onlinePlayersCacheTime)) {
            const rawPlayers = await this.get("game/usernames");
            if (!rawPlayers) return null;
            const players = [];
            for (const displayName of rawPlayers) {
                const username = displayName.toLowerCase();
                if (username.startsWith("guest")) {
                    players.push(displayName);
                    continue;
                }
                AccountData.getByUsername(username).then((account) => {
                    if (!account.displayName) {
                        account.displayName = displayName;
                        account.save();
                    }
                });
                players.push(displayName);
            }
            this.cache.onlinePlayers.players = players;
            this.cache.onlinePlayers.fetched = Date.now();
        }
        return this.cache.onlinePlayers.players;
    }

    async getServerStats(force = false) {
        if (force || this.cache.serverStats.isOutdated(this.serverStatsCacheTime)) {
            const serverStats = await this.get("game/list");
            if (!serverStats) return null;

            this.cache.serverStats.localServers = [];
            this.cache.serverStats.remoteServers = [];

            for (const server of serverStats.local) {
                this.cache.serverStats.localServers.push(...server);
            }

            for (const remote in serverStats.remotes) {
                const servers = serverStats.remotes[remote];
                for (const server of servers) {
                    this.cache.serverStats.remoteServers.push(...server);
                }
            }

            this.cache.serverStats.connected = serverStats.connected;
            this.cache.serverStats.capacity = serverStats.capacity;
            this.cache.serverStats.autoConnect = serverStats.autoConnect;
            this.cache.serverStats.fetched = Date.now();
        }
        return this.cache.serverStats;
    }

    async getHallOfFame(force = false) {
        if (force || this.cache.hallOfFame.isOutdated(this.hallOfFameCacheTime)) {
            const hallOfFame = await this.get("game/hall_of_fame");
            if (!hallOfFame) return null;
            this.cache.hallOfFame.entries = hallOfFame.players;
            this.cache.hallOfFame.fetched = Date.now();
        }
        return this.cache.hallOfFame.entries;
    }

    async getRuns(filters) {
        // Since runs can have many filters, they aren't cached.
        const filterStore = [];
        for (const name in filters) {
            const value = filters[name];
            if (!name || !value) continue;
            if (value === "X") continue;
            filterStore.push(`${name}=${value}`);
        }

        const runs = await this.get("runs?" + filterStore.join("&"));
        if (!runs) return null;
        return runs;
    }
}

let failedToConnect = true;
async function updateLastSeen(evadesAPI) {
    const onlinePlayers = await evadesAPI.getOnlinePlayers();

    if (!onlinePlayers) {
        failedToConnect = true;
        return;
    } else if (failedToConnect) {
        // Fetch changelog after being unable to connect.
        failedToConnect = false;
        await Changelog.updateChangelog();
    }

    AccountData.bulkUpdateOnlinePlayers(onlinePlayers, Math.floor(evadesAPI.onlinePlayersCacheTime / 1000));
}

async function updateCareerVP(evadesAPI) {
    // We know that only players in the hall of fame can have an outdated career VP.
    const hallOfFame = await evadesAPI.getHallOfFame();
    AccountData.bulkUpdateHallOfFame(hallOfFame);
}

export default EvadesAPI;