import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, SlashCommandBuilder } from "discord.js";

class LogalModalInteraction extends DefaultInteraction {
    static name = "login-modal";
    static applicationCommand = new SlashCommandBuilder()
        .setName(LogalModalInteraction.name)
        .setDescription("Link to your Evades.io account")

    constructor() {
        super(LogalModalInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const username = interaction.getTextInputValue("username");
        const password = interaction.getTextInputValue("password");
        if(!username || !password) return "Invalid credentials.";
        const data = await interaction.client.evadesAPI.login(username, password);
        if(!data[0]) return `Couldn't login! ${data[1]}`;
        return data;
    }
}

export default LogalModalInteraction;