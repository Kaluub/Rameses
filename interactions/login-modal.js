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
        const username = interaction.fields.getTextInputValue("username");
        const password = interaction.fields.getTextInputValue("password");
        if(!username || !password) return "Invalid credentials.";
        const data = await interaction.client.evadesAPI.login(username, password);
        if(!data) return `Couldn't login!`;
        return data;
    }
}

export default LogalModalInteraction;