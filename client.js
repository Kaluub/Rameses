import { Client} from "discord.js";
import { readFileSync, existsSync } from "fs";
import EvadesAPI from "./evadesAPI.js";
import InteractionHandler from "./interactionHandler.js";

class DiscordClient extends Client {
    constructor() {
        super({intents: []});
        this.evadesAPI = new EvadesAPI();
        this.interactionHandler = new InteractionHandler();
        this.on("interactionCreate", this.interactionHandler.handleInteraction);
    }

    async clientLogin() {
        if(!existsSync("./token")) throw "Token file not provided! Please put a bot token in a file named 'token' in this directory.";
        await this.login(readFileSync("./token", {encoding: "utf8"}));
        console.log("Client logged in.")
    }

    async updateInteractions() {
        await this.application.fetch();
        const result = await this.application.commands.set(await this.interactionHandler.getApplicationCommands());
        console.log("Application commands set.");
    }
}

export default DiscordClient;