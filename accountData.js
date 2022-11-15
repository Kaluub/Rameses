import { Collection } from "discord.js";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient("mongodb://localhost:27017");
await mongoClient.connect().catch(err => {throw "Database error!"});

const database = mongoClient.db("Rameses");
const accounts = database.collection("accounts");

class AccountData {
    static cache = {};

    constructor(data) {
        this.username = data.username;
        this.displayName = data?.displayName ?? null;
        this.discordId = data?.discordId ?? null;
        this.lastSeen = data?.lastSeen ?? null;
    }

    async save() {
        AccountData.cache[this.username] = this;
        await accounts.updateOne({username: this.username}, {$set: this}, {upsert: true});
    }

    static async getByUsername(username) {
        const accountData = this.cache[username] ?? await accounts.findOne({username: username.toLowerCase()});
        if(!accountData) return new AccountData({username});
        this.cache[username] = accountData;
        return new AccountData(accountData);
    }

    static async getByDiscordId(discordId) {
        const accountData = await accounts.findOne({discordId: discordId});
        if(!accountData) return null;
        return new AccountData(accountData);
    }
}

export default AccountData;