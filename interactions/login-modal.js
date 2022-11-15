import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, SlashCommandBuilder } from "discord.js";
import AccountData from "../accountData.js";

class LogalModalInteraction extends DefaultInteraction {
    static name = "login-modal";
    static applicationCommand = new SlashCommandBuilder()
        .setName(LogalModalInteraction.name)
        .setDescription("Link to your Evades.io account")

    constructor() {
        super(LogalModalInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const username = interaction.fields.getTextInputValue("username");
        const password = interaction.fields.getTextInputValue("password");
        if(!username || !password) return "Invalid credentials.";
        const data = await interaction.client.evadesAPI.login(username, password);
        if(!data) return `Couldn't login!`;
        let account = await AccountData.getByUsername(username);
        account.discordId = interaction.user.id;
        await account.save();
        return `Successfully linked with the account "${account?.displayName ?? account.username}".`;
    }
}

export default LogalModalInteraction;