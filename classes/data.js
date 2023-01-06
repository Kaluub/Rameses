import { Collection } from "discord.js";
import { v4 as uuid } from "uuid";
import { MongoClient } from "mongodb";
import { readJSON } from "../utils.js";

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
await mongoClient.connect().catch(err => {throw "Database error!\n" + err});
const database = mongoClient.db("Rameses");

const accounts = database.collection("accounts");
const tournaments = database.collection("tournaments");
const wikiPages = database.collection("wiki");
const discordUsers = database.collection("discord");
const discordGuilds = database.collection("guilds");

class AccountData {
    static cache = new Collection();

    constructor(data) {
        this.username = data.username;
        this.displayName = data?.displayName ?? null;
        this.careerVP = data?.careerVP ?? null;
        this.lastSeen = data?.lastSeen ?? null;
        this.playTime = data?.playTime ?? 0; // In SECONDS.
        this.activity = data?.activity ?? {};
    }

    async save(noCache = false) {
        if(!noCache) AccountData.cache.set(this.username.toLowerCase(), this);
        await accounts.updateOne({username: this.username.toLowerCase()}, {$set: this}, {upsert: true});
    }

    static async count(filter = {}) {
        return await accounts.countDocuments(filter);
    }

    static find(filter, options) {
        return accounts.find(filter, options);
    }

    static findMatchingUsernames(username, maxDocuments = 25) {
        if(!username.length) return accounts.aggregate([{$sample: {size: maxDocuments}}]);
        const regexp = new RegExp(username.toLowerCase());
        return accounts.find({username: regexp}).limit(maxDocuments);
    }

    static async getByUsername(username, createIfNonexistant = true, ignoreGuest = true) {
        if(ignoreGuest && username.toLowerCase().startsWith("guest")) return null;
        const accountData = this.cache.get(username.toLowerCase()) ?? await accounts.findOne({username: username.toLowerCase()});
        if(!accountData && createIfNonexistant) return new AccountData({username: username.toLowerCase()});
        if(!accountData && !createIfNonexistant) return null;
        AccountData.cache.set(username.toLowerCase(), accountData);
        return new AccountData(accountData);
    }

    static async loadTopVP() {
        console.log("Loading VP leaderboard from file... This will take a while!")
        const accounts = readJSON("./secrets/VP.json");
        if(!accounts) return console.log("There is no file data!");
        for (const name in accounts) {
            const data = accounts[name];
            AccountData.getByUsername(data.name, true, false).then((acc) => {
                acc.careerVP = data.vp;
                acc.displayName = data.name;
                acc.save(true);
            });
        }
        console.log("Loaded VP leaderboard from file!")
    }
}

class TournamentData {
    constructor(data) {
        this.id = data?.id;
        this.created = data?.created ?? Date.now();
        this.leaderboard = data?.leaderboard ?? [];
        this.topFormat = data?.topFormat ?? data?.format?.split("\n")[0] ?? "[{position}] [{player}]";
        this.bottomFormat = data?.bottomFormat ?? data?.format?.split("\n")[1] ?? "- {area} ;; {time} ;; {attempt}";
        this.maxAttempts = data?.maxAttempts ?? 3;
        this.duration = data?.duration ?? 604800000;
        this.type = data?.type ?? "best";
    }

    async save() {
        await tournaments.updateOne({id: this.id}, {$set: this}, {upsert: true});
    }

    static async count() {
        return await tournaments.estimatedDocumentCount();
    }

    static async getByID(id) {
        const tournamentData = await tournaments.findOne({id});
        if(!tournamentData) return null;
        return new TournamentData(tournamentData);
    }
}

class WikiPageData {
    static cache = new Collection();

    constructor(data) {
        this.title = data.title;
        this.uuid = data?.uuid ?? uuid();
        this.created = data?.created ?? Date.now();
        this.edited = data?.edited ?? Date.now();
        this.authors = data?.authors ?? [];
        this.content = data?.content ?? "";
        this.private = data?.private ?? false;
    }

    async save() {
        AccountData.cache.set(this.title, this);
        await wikiPages.updateOne({username: this.title}, {$set: this}, {upsert: true});
    }

    static async count() {
        return await wikiPages.estimatedDocumentCount();
    }

    static async getByTitle(title) {
        const page = this.cache.get(title) ?? await wikiPages.findOne({title});
        if(!page) return null;
        return new WikiPageData(page);
    }

    static async getByUUID(id) {
        const page = await wikiPages.findOne({uuid: id});
        if(!page) return null;
        return new WikiPageData(page);
    }

    static findMatchingPages(title, maxDocuments = 25) {
        if(!title.length) return wikiPages.aggregate([{$sample: {size: maxDocuments}}]);
        const regexp = new RegExp(title);
        return wikiPages.find({title: regexp}).limit(maxDocuments);
    }
}

class DiscordUserData {
    static cache = new Collection();

    constructor(data) {
        this.id = data.id;
        this.friends = data?.friends ?? [];
        this.created = data?.created ?? Date.now();
    }

    async save() {
        DiscordUserData.cache.set(this.id, this);
        await discordUsers.updateOne({id: this.id}, {$set: this}, {upsert: true});
    }

    static async getByID(id) {
        const userData = this.cache.get(id) ?? await discordUsers.findOne({id});
        if(!userData) return new DiscordUserData({id});
        return new DiscordUserData(userData);
    }
}

class DiscordGuildData {
    static cache = new Collection();

    constructor(data) {
        this.id = data.id;
        this.tournamentOrganizerRole = data?.tournamentOrganizerRole ?? null;
        this.tournamentSpectatorRole = data?.tournamentSpectatorRole ?? null;
        this.forceAccountExistence = data?.forceAccountExistence ?? true;
        this.created = data?.created ?? Date.now();
    }

    async save() {
        DiscordGuildData.cache.set(this.id, this);
        await discordGuilds.updateOne({id: this.id}, {$set: this}, {upsert: true});
    }

    static async getByID(id) {
        const guildData = this.cache.get(id) ?? await discordGuilds.findOne({id});
        if(!guildData) return new DiscordGuildData({id});
        return new DiscordGuildData(guildData);
    }
}

export { AccountData, TournamentData, WikiPageData, DiscordUserData, DiscordGuildData };