import { Collection } from "discord.js";
import { v4 as uuid } from "uuid";
import { MongoClient } from "mongodb";
import Utils from "./utils.js";
import Config from "./config.js";

const connectionURL = `mongodb://${Config.MONGO_USERNAME && Config.MONGO_PASSWORD ? `${Config.MONGO_USERNAME}:${Config.MONGO_PASSWORD}@`: ""}127.0.0.1:27017`;
const mongoClient = new MongoClient(connectionURL);
await mongoClient.connect().catch(err => { throw "Database error!\n" + err });
const database = mongoClient.db("Rameses");

const accounts = database.collection("accounts");
const tournaments = database.collection("tournaments");
const wikiPages = database.collection("wiki");
const discordUsers = database.collection("discord");
const discordGuilds = database.collection("guilds");

class AccountData {
    constructor(data) {
        this.username = data.username;
        this.displayName = data?.displayName ?? null;
        this.careerVP = data?.careerVP ?? null;
        this.lastSeen = data?.lastSeen ?? null;
        this.playTime = data?.playTime ?? 0; // In seconds.
        this.activity = data?.activity ?? {};
    }

    async save() {
        await accounts.updateOne({ username: this.username.toLowerCase() }, { $set: this }, { upsert: true });
    }

    static async getByUsername(username, createIfNonexistant = true, ignoreGuest = true) {
        if (ignoreGuest && username.toLowerCase().startsWith("guest")) return null;
        const accountData = await accounts.findOne({ username: username.toLowerCase() });
        if (!accountData && createIfNonexistant) return new AccountData({ username: username.toLowerCase() });
        if (!accountData && !createIfNonexistant) return null;
        return new AccountData(accountData);
    }

    static async count(filter = {}) {
        return await accounts.countDocuments(filter);
    }

    static find(filter, options) {
        return accounts.find(filter, options);
    }

    static findMatchingUsernames(username, maxDocuments = 25) {
        if (!username.length) return accounts.aggregate([{ $sample: { size: maxDocuments } }]);
        const regexp = new RegExp(username.toLowerCase());
        return accounts.find({ username: regexp }).limit(maxDocuments);
    }

    static getTopVP(maxDocuments = 25, offset = 0) {
        return accounts.find().sort({ careerVP: -1 }).skip(offset).limit(maxDocuments);
    }

    static getTopActivity(maxDocuments = 25, offset = 0) {
        return accounts.find().sort({ playTime: -1 }).skip(offset).limit(maxDocuments);
    }

    static getRecentlyOnline(maxDocuments = 25, offset = 0) {
        return accounts.find({ lastSeen: { $lte: Math.floor(Date.now() / 1000) - 15 }}).sort({ lastSeen: -1 }).skip(offset).limit(maxDocuments);
    }

    static async getSumOfField(fieldName) {
        return (await accounts.aggregate([{ $group: { _id: null, value: { $sum: `$${fieldName}` } } }]).toArray())[0].value;
    }

    static bulkUpdateOnlinePlayers(onlinePlayers, timeInterval) {
        const lastSeen = Math.floor(Date.now() / 1000);
        const hour = new Date().getUTCHours().toString();
        const names = onlinePlayers
            .filter(name => !name.startsWith("Guest"))
            .map(name => name.toLowerCase());
        
        accounts.updateMany(
            {username: {$in: names}},
            {
                $set: {
                    lastSeen: lastSeen
                },
                $inc: {
                    playTime: timeInterval,
                    [`activity.${hour}`]: 1
                }
            },
            {upsert: true}
        );
    }

    static bulkUpdateHallOfFame(hallOfFame) {
        const operations = [];
        for (const [username, weeklyVP, careerVP] of hallOfFame) {
            if (!username || !careerVP) {
                continue;
            }
            operations.push({
                updateOne: {
                    filter: {username: username.toLowerCase()},
                    update: {
                        $set: {
                            careerVP: parseInt(careerVP),
                            displayName: username
                        }
                    },
                    upsert: true
                }
            });
        }
        accounts.bulkWrite(operations);
    }

    static async loadTopVP() {
        console.log("Loading VP leaderboard from file... This will take a while!")
        const accounts = Utils.readJSON("./data/VP.json");
        if (!accounts) return console.log("There is no file data!");
        for (const name in accounts) {
            const data = accounts[name];
            AccountData.getByUsername(data.name, true, false).then((acc) => {
                acc.careerVP = data.vp;
                acc.displayName = data.name;
                acc.save();
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
        await tournaments.updateOne({ id: this.id }, { $set: this }, { upsert: true });
    }

    static async count() {
        return await tournaments.estimatedDocumentCount();
    }

    static async getByID(id) {
        const tournamentData = await tournaments.findOne({ id });
        if (!tournamentData) return null;
        return new TournamentData(tournamentData);
    }
}

class WikiPageData {
    constructor(data) {
        this.title = data.title;
        this.uuid = data?.uuid ?? uuid();
        this.created = data?.created ?? Date.now();
        this.edited = data?.edited ?? Date.now();
        this.authors = data?.authors ?? [];
        this.links = data?.links ?? [];
        this.content = data?.content ?? "";
        this.imageURL = data?.imageURL ?? null;
        this.private = data?.private ?? false;
    }

    async save() {
        await wikiPages.updateOne({ uuid: this.uuid }, { $set: this }, { upsert: true });
    }

    static async count() {
        return await wikiPages.estimatedDocumentCount();
    }

    static async getByTitle(title) {
        const page = await wikiPages.findOne({ title });
        if (!page) return null;
        return new WikiPageData(page);
    }

    static async getByUUID(id) {
        const page = await wikiPages.findOne({ uuid: id });
        if (!page) return null;
        return new WikiPageData(page);
    }

    static findMatchingPages(title, maxDocuments = 25) {
        if (!title.length) return wikiPages.aggregate([{ $sample: { size: maxDocuments } }]);
        const regexp = new RegExp(title);
        return wikiPages.find({ title: regexp }).limit(maxDocuments);
    }
}

class DiscordUserData {
    constructor(data) {
        this.id = data.id;
        this.friends = data?.friends ?? [];
        this.username = data?.username ?? null;
        this.region = data?.region ?? null;
        this.created = data?.created ?? Date.now();
    }

    async save() {
        await discordUsers.updateOne({ id: this.id }, { $set: this }, { upsert: true });
    }

    static async getByID(id) {
        const userData = await discordUsers.findOne({ id });
        if (!userData) return new DiscordUserData({ id });
        return new DiscordUserData(userData);
    }

    static async getByUsername(username) {
        const userData = await discordUsers.findOne({ username });
        if (!userData) return null;
        return new DiscordUserData(userData);
    }
}

class DiscordGuildData {
    constructor(data) {
        this.id = data.id;
        this.tournamentOrganizerRole = data?.tournamentOrganizerRole ?? null;
        this.tournamentSpectatorRole = data?.tournamentSpectatorRole ?? null;
        this.forceAccountExistence = data?.forceAccountExistence ?? true;
        this.created = data?.created ?? Date.now();
    }

    async save() {
        await discordGuilds.updateOne({ id: this.id }, { $set: this }, { upsert: true });
    }

    static async getByID(id) {
        const guildData = await discordGuilds.findOne({ id });
        if (!guildData) return new DiscordGuildData({ id });
        return new DiscordGuildData(guildData);
    }
}

export { AccountData, TournamentData, WikiPageData, DiscordUserData, DiscordGuildData };