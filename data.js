import { Collection } from "discord.js";
import { v4 as uuid } from "uuid";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient("mongodb://localhost:27017");
await mongoClient.connect().catch(err => {throw "Database error!\n" + err});
const database = mongoClient.db("Rameses");

const accounts = database.collection("accounts");
const tournaments = database.collection("tournaments");
const wikiPages = database.collection("wiki");
const discordUsers = database.collection("discord");

class AccountData {
    static cache = new Collection();

    constructor(data) {
        this.username = data.username;
        this.displayName = data?.displayName ?? null;
        this.lastSeen = data?.lastSeen ?? null;
    }

    async save() {
        AccountData.cache.set(this.username.toLowerCase(), this);
        await accounts.updateOne({username: this.username.toLowerCase()}, {$set: this}, {upsert: true});
    }

    static async count() {
        return await accounts.estimatedDocumentCount();
    }

    static find(filter, options) {
        return accounts.find(filter, options);
    }

    static findMatchingUsernames(username, maxDocuments = 25) {
        if(!username.length) return accounts.aggregate([{$sample: {size: maxDocuments}}]);
        const regexp = new RegExp(username.toLowerCase());
        return accounts.find({username: regexp}).limit(maxDocuments);
    }

    static async getByUsername(username, createIfNonexistant = true) {
        if(username.toLowerCase().startsWith("guest")) return null;
        const accountData = this.cache.get(username.toLowerCase()) ?? await accounts.findOne({username: username.toLowerCase()});
        if(!accountData && createIfNonexistant) return new AccountData({username: username.toLowerCase()});
        if(!accountData && !createIfNonexistant) return null;
        AccountData.cache.set(username.toLowerCase(), accountData);
        return new AccountData(accountData);
    }
}

class TournamentData {
    constructor(data) {
        this.id = data?.id;
        this.created = data?.created ?? Date.now();
        this.leaderboard = data?.leaderboard ?? [];
        this.format = data?.format ?? "[{position}] [{player}]\n{area} ;; {time} ;; {attempt}"
        this.maxAttempts = data?.maxAttempts ?? 3;
        this.teamSize = data?.teamSize ?? 1;
        this.duration = data?.duration ?? 604800000;
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

export { AccountData, TournamentData, WikiPageData, DiscordUserData };