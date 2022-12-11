import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { AccountData } from "../data.js";

class DebugInteraction extends DefaultInteraction {
    static name = "debug";
    static noGlobalInteraction = true;
    static guilds = ["1026074983249739829"];
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
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("stats")
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
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("flushcache")
                .setDescription("Clear the caches")
        )

    constructor() {
        super(DebugInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false);
        if(subcommand == "check") {
            const username = interaction.options.getString("username", false);
            if(!username) return "No user found.";
            const account = await AccountData.getByUsername(username, false);
            if(!account) return "No data stored for this user yet.";
            return `Stored data:\n\`\`\`json\n${JSON.stringify(account, null, 4)}\n\`\`\``;
        }
        if(subcommand == "stats") {
            return `Stats:
Guilds cached: ${interaction.client.guilds.cache.size}
Users cached: ${interaction.client.users.cache.size}
Channels cached: ${interaction.client.channels.cache.size}

Stored accounts: ${await AccountData.count()}
Cached accounts: ${AccountData.cache.size}
Users online in the last 24 hours: ${await AccountData.find({"lastSeen": {"$gt": Math.floor(Date.now() / 1000) - 1000*60*60*24}}).count()}`;
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
        if(subcommand == "flushcache") {
            const size = AccountData.cache.size;
            AccountData.cache.clear();
            interaction.client.evadesAPI.resetCache();
            return `Flushed ${size} account caches.`;
        }
        return "How did we get here?";
    }
}

export default DebugInteraction;