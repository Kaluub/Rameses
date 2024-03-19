import { Client, IntentsBitField } from "discord.js";
import Config from "./config.js";
import EvadesAPI from "./evadesAPI.js";
import InteractionHandler from "./interactionHandler.js";

class DiscordClient extends Client {
    constructor() {
        super({ intents: [IntentsBitField.Flags.Guilds] });
        this.evadesAPI = new EvadesAPI();
        this.interactionHandler = new InteractionHandler();
        this.on("interactionCreate", this.interactionHandler.handleInteraction);
    }

    async clientLogin() {
        await this.login(Config.TOKEN);
        console.log("Client logged in.")
    }

    async updateInteractions() {
        await this.application.fetch();
        await this.interactionHandler.setApplicationCommands(this);
        console.log("Application commands set.");
    }
}

export default DiscordClient;