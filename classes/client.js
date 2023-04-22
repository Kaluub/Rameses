import { Client, IntentsBitField } from "discord.js";
import Config from "./config.js";
import EvadesAPI from "./evadesAPI.js";
import InteractionHandler from "./interactionHandler.js";
import Sheets from "./sheets.js";

class DiscordClient extends Client {
    constructor() {
        super({ intents: [IntentsBitField.Flags.Guilds] });
        this.evadesAPI = new EvadesAPI();
        this.interactionHandler = new InteractionHandler();
        if(Config.GOOGLE_API_ENABLED) this.sheets = new Sheets("18QTGlPn8WI5NfymccFV2m1duPcbUFahWtY22Qc5gc3g");
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