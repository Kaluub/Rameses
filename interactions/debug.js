import DefaultInteraction from "../defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import AccountData from "../accountData.js";

class DebugInteraction extends DefaultInteraction {
    static name = "debug";
    static applicationCommand = new SlashCommandBuilder()
        .setName(DebugInteraction.name)
        .setDescription("Generic debug data")
        .setDefaultMemberPermissions("0")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("check")
                .setDescription("Check the raw data stored for a user")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("The username to search for")
                        .setRequired(true)
                )
        )

    constructor() {
        super(DebugInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        if(interaction.getSubcommand(false) == "check") {
            const username = interaction.options.getString("username", false);
            if(!username) return "No user found.";
            const account = await AccountData.getByUsername(username, false);
            if(!account) return "No data stored for this user yet.";
            return `Stored data:\n\`\`\`json\n${JSON.stringify(account, null, 4)}\n\`\`\``;
        }
        return "How did we get here?"
    }
}

export default DebugInteraction;