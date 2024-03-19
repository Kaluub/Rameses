import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { AccountData, DiscordUserData } from "../classes/data.js";
import Config from "../classes/config.js";

class DebugInteraction extends DefaultInteraction {
    static name = "debug";
    static isGlobalInteraction = false;
    static guilds = [Config.DEVELOPMENT_SERVER];
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
                .setName("fixname")
                .setDescription("Fix (reset) the in-game name for a Discord user")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("id")
                        .setDescription("The user's ID")
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
        if (subcommand == "check") {
            const username = interaction.options.getString("username", false);
            if (!username) return "No user found.";
            const account = await AccountData.getByUsername(username, false);
            if (!account) return "No data stored for this user yet.";
            return `Stored data:\n\`\`\`json\n${JSON.stringify(account, null, 4)}\n\`\`\``;
        }
        if (subcommand == "stats") {
            return `Stats:
Guilds cached: ${interaction.client.guilds.cache.size}
Users cached: ${interaction.client.users.cache.size}
Channels cached: ${interaction.client.channels.cache.size}

Stored accounts: ${await AccountData.count()}
Cached accounts: ${AccountData.cache.size}`;
        }
        if (subcommand == "fixname") {
            const id = interaction.options.getString("id", false);
            if (!id) return "No user found.";
            let data = await DiscordUserData.getByID(id, false);
            if (!data) return "No Discord data is stored for this user yet.";
            data.username = null;
            await data.save();
            return `Discord in-game name was cleared from <@${id}> (${id})`;
        }
        if (subcommand == "flushcache") {
            const size = AccountData.cache.size;
            AccountData.cache.clear();
            interaction.client.evadesAPI.resetCache();
            return `Flushed ${size} account caches.`;
        }
        return "How did we get here?";
    }
}

export default DebugInteraction;