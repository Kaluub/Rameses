import { Client, IntentsBitField } from "discord.js";
import { readFileSync, existsSync } from "fs";
import EvadesAPI from "./evadesAPI.js";
import InteractionHandler from "../interactionHandler.js";

class DiscordClient extends Client {
    constructor() {
        super({ intents: [IntentsBitField.Flags.Guilds] });
        this.evadesAPI = new EvadesAPI();
        this.interactionHandler = new InteractionHandler();
        this.on("interactionCreate", this.interactionHandler.handleInteraction);
    }

    async clientLogin() {
        if (!existsSync("./secrets/token")) throw "Token file not provided! Please put a bot token in a file named 'token' in the './secrets' directory.";
        await this.login(readFileSync("./secrets/token", { encoding: "utf8" }).trim());
        console.log("Client logged in.")
    }

    async updateInteractions() {
        await this.application.fetch();
        await this.interactionHandler.setApplicationCommands(this);
        console.log("Application commands set.");
    }
}

export default DiscordClient;