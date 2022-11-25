import { Collection } from "discord.js";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient("mongodb://localhost:27017");
await mongoClient.connect().catch(err => {throw "Database error!"});

const database = mongoClient.db("Rameses");
const accounts = database.collection("accounts");
const tournaments = database.collection("tournaments");

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

    static findMatchingUsernames(username) {
        const regexp = new RegExp(username);
        console.log(regexp)
        return accounts.find({username: regexp}).limit(25);
    }

    static async getByUsername(username, createIfNonexistant = true) {
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

export { AccountData, TournamentData };