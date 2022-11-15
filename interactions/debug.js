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
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("checkdb")
                .setDescription("Count the elements in the database & the amount cached")
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("fixusername")
                .setDescription("Fix (reset) the display name for a player")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("The username to fix")
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("cleardiscord")
                .setDescription("Remove in-game link for a user's Discord ID")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("id")
                        .setDescription("The user ID to unlink")
                        .setRequired(true)
                )
        )

    constructor() {
        super(DebugInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false)
        if(subcommand == "check") {
            const username = interaction.options.getString("username", false);
            if(!username) return "No user found.";
            const account = await AccountData.getByUsername(username, false);
            if(!account) return "No data stored for this user yet.";
            return `Stored data:\n\`\`\`json\n${JSON.stringify(account, null, 4)}\n\`\`\``;
        }
        if(subcommand == "checkdb") {
            return `Database stats:\nStored users: ${await AccountData.count()}\nCached users: ${AccountData.cache.size}`;
        }
        if(subcommand == "fixusername") {
            const username = interaction.options.getString("username", false);
            if(!username) return "No user found.";
            let account = await AccountData.getByUsername(username, false);
            if(!account) return "No data stored for this user yet.";
            account.displayName = null;
            await account.save();
            return `Display name cleared from "${account?.displayName ?? account.username}"`;
        }
        
        if(subcommand == "cleardiscord") {
            const userId = interaction.options.getString("id", false);
            if(!userId) return "User ID not supplied.";
            let account = await AccountData.getByDiscordId(userId);
            if(!account) return "No accounts were linked with this user ID.";
            account.discordId = null;
            await account.save();
            return `Discord unlinked from "${account?.displayName ?? account.username}"`;
        }
        return "How did we get here?";
    }
}

export default DebugInteraction;