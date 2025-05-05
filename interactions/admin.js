import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { AccountData } from "../classes/data.js";
import Config from "../classes/config.js";
import Utils from "../classes/utils.js";

class AdminInteraction extends DefaultInteraction {
    static name = "admin";
    static isGlobalInteraction = false;
    static guilds = [Config.DEVELOPMENT_SERVER];
    static applicationCommand = new SlashCommandBuilder()
        .setName(AdminInteraction.name)
        .setDescription("Bot admin tools")
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
                .setName("interactions")
                .setDescription("Rebuilds all interactions")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("guild")
                        .setDescription("A guild ID to clear interactions for if needed.")
                        .setRequired(false)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("tests")
                .setDescription("Run tests")
        )

    constructor() {
        super(AdminInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommand = this.getSubcommand(interaction);

        if (subcommand === "check") {
            const username = interaction.options.getString("username", false);
            if (!username) return "No user found.";
            const account = await AccountData.getByUsername(username, false);
            if (!account) return "No data stored for this user yet.";
            return `Stored data:\n\`\`\`json\n${JSON.stringify(account, null, 4)}\n\`\`\``;
        }

        if (subcommand === "stats") {
            return "Stats:\n" +
                `Bot uptime: ${Utils.formatSeconds(interaction.client.uptime / 1000)}\n` +
                `Guilds cached: ${interaction.client.guilds.cache.size}\n` +
                `Users cached: ${interaction.client.users.cache.size}\n` +
                `Channels cached: ${interaction.client.channels.cache.size}\n\n` +
                `Stored accounts: ${await AccountData.count()}`;
        }

        if (subcommand === "interactions") {
            const guildId = interaction.options.getString("guild", false);
            if (guildId) {
                const guild = await interaction.client.guilds.fetch(guildId);
                if (!guild) {
                    return "Guild could not be resolved.";
                }
                await guild.commands.set([]);
                return `Cleared all commands for server ${guild.name}.`;
            }
            
            interaction.client.updateInteractions();
            return "All interactions will be updated.";
        }

        if (subcommand === "tests") {
            await interaction.reply("Running tests.");
            interaction.client.runTests(interaction);
            return;
        }

        return "How did we get here?";
    }
}

export default AdminInteraction;