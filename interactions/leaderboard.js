import DefaultInteraction from "../classes/defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from "discord.js";
import { AccountData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import { formatSeconds, sanitizeUsername } from "../utils.js";

class LeaderboardInteraction extends DefaultInteraction {
    static name = "leaderboard";
    static applicationCommand = new SlashCommandBuilder()
        .setName(LeaderboardInteraction.name)
        .setDescription("Leaderboard commands.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("vp")
                .setDescription("Get the top career VP accounts.")
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("limit")
                        .setDescription("The amount of people to show.")
                        .setMaxValue(50)
                        .setRequired(false)
                )
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("offset")
                        .setDescription("The index to start at.")
                        .setRequired(false)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("activity")
                .setDescription("Get the most active players in Evades.")
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("limit")
                        .setDescription("The amount of people to show.")
                        .setMaxValue(50)
                        .setRequired(false)
                )
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("offset")
                        .setDescription("The index to start at.")
                        .setRequired(false)
                )
        )

    constructor() {
        super(LeaderboardInteraction.name, [InteractionType.ApplicationCommand]);
        this.defer = true;
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommand == "vp") {
            const limit = interaction.options.getInteger("limit") ?? 25;
            const offset = interaction.options.getInteger("offset") ?? 0;
            const accounts = await AccountData.getTopVP(limit, offset).toArray();
            if (!accounts.length) return Locale.text(interaction, "NO_MATCHES");
            const total = await AccountData.count();
            let string = Locale.text(interaction, "TOP_VP");
            let i = 0 + offset;
            for (const account of accounts) {
                i += 1;
                string += `\n${i}. ${sanitizeUsername(account.displayName ?? account.username)}: ${account.careerVP} VP`;
            }
            const embed = new EmbedBuilder()
                .setColor("#dd33bb")
                .setDescription(string)
                .setTimestamp()
            return { embeds: [embed] };
        }
        if (subcommand == "activity") {
            const limit = interaction.options.getInteger("limit") ?? 25;
            const offset = interaction.options.getInteger("offset") ?? 0;
            const accounts = await AccountData.getTopActivity(limit, offset).toArray();
            if (!accounts.length) return Locale.text(interaction, "NO_MATCHES");
            const total = await AccountData.count();
            let string = Locale.text(interaction, "TOP_PLAY_TIME");
            let i = 0 + offset;
            for (const account of accounts) {
                i += 1;
                string += `\n${i}. ${sanitizeUsername(account.displayName ?? account.username)}: ${formatSeconds(account.playTime)}`;
            }
            const embed = new EmbedBuilder()
                .setColor("#bb33dd")
                .setDescription(string)
                .setTimestamp()
            return { embeds: [embed] };
        }
        return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
    }
}

export default LeaderboardInteraction;