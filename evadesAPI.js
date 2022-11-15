import fetch from "node-fetch";
import AccountData from "./accountData.js";

class CachedData {
    constructor() {
        this.fetched = Date.now();
    }

    isOutdated(cacheLifetime) {
        return this.fetched + cacheLifetime < Date.now();
    }
}

class PlayerManager {
    constructor() {
        this.players = {};
    }

    getPlayer(username) {
        return this.players[username.toLowerCase()] ?? null;
    }

    updatePlayer(username, data) {
        this.players[username.toLowerCase()] = new PlayerDetailsData(data);
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
        this.cache = {
            playerManager: new PlayerManager(),
            onlinePlayers: null,
            hallOfFame: null
        };
        this.playerDetailsCacheTime = 300000;
        this.onlinePlayersCacheTime = 10000;
        this.hallOfFameCacheTime = 60000;
        updateLastSeen(this);
        updateDisplayNames(this);
        setInterval(updateLastSeen, this.onlinePlayersCacheTime, this);
        setInterval(updateDisplayNames, this.hallOfFameCacheTime, this);
    }

    async get(endpoint) {
        const data = await fetch(this.fetchURL + endpoint)
            .catch(console.error)
        if(!data || !data.ok) return null;
        return await data.json();
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
        if(force || !this.cache.onlinePlayers || this.cache.onlinePlayers.isOutdated(this.onlinePlayersCacheTime)) {
            const rawPlayers = await this.get("game/usernames");
            const players = [];
            if(!this.cache.onlinePlayers) this.cache.onlinePlayers = new OnlinePlayersData();
            for(const username of rawPlayers) {
                if(username.startsWith("guest")) {
                    let guestName = username.slice(5);
                    players.push("Guest" + guestName[0].toUpperCase() + guestName.slice(1));
                    continue;
                }
                const account = await AccountData.getByUsername(username);
                players.push(account.displayName ?? username);
            }
            this.cache.onlinePlayers.players = players;
        }
        return this.cache.onlinePlayers.players;
    }

    async getHallOfFame(force = false) {
        if(force || !this.cache.hallOfFame || this.cache.hallOfFame.isOutdated(this.hallOfFameCacheTime)) {
            const hallOfFame = await this.get("game/hall_of_fame");
            if(!this.cache.hallOfFame) this.cache.hallOfFame = new HallOfFameData();
            this.cache.hallOfFame.entries = hallOfFame.players;
        }
        return this.cache.hallOfFame.entries;
    }

    async login(username, password) {
        const request = await fetch(this.fetchURL + "auth/login", {method: "POST", body: {username, password}});
        return [request.ok, await request.json()];
    }
}

async function updateLastSeen(evadesAPI) {
    const onlinePlayers = await evadesAPI.getOnlinePlayers();
    for(const username of onlinePlayers) {
        if(username.startsWith("Guest")) continue;
        let account = await AccountData.getByUsername(username);
        account.lastSeen = Math.floor(Date.now() / 1000);
        await account.save();
    }
}

async function updateDisplayNames(evadesAPI, force = false) {
    const hallOfFame = await evadesAPI.getHallOfFame();
    for(const entry of hallOfFame) {
        const username = entry[0];
        let account = await AccountData.getByUsername(username);
        if(account.displayName && !force) continue;
        account.displayName = username;
        await account.save();
    }
}

export default EvadesAPI;