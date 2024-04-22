import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from "discord.js";
import { AccountData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";

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
        super(LeaderboardInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
        this.updateIfComponent = true;
    }

    async execute(interaction) {
        const subcommand = interaction?.options?.getSubcommand(false) ?? interaction?.customId?.split("/")?.[1];
        if (subcommand == "vp") {
            const limit = Math.min(this.getIntegerArgument(interaction, "limit", 2), 50) || 25;
            const offset = Math.max(this.getIntegerArgument(interaction, "offset", 3), 0) || 0;
            const accounts = await AccountData.getTopVP(limit, offset).toArray();
            
            if (!accounts.length)
                return Locale.text(interaction, "NO_MATCHES");
            
            let string = Locale.text(interaction, "TOP_VP");
            let i = 0 + offset;
            
            for (const account of accounts) {
                i += 1;
                string += `\n**${i}.** ${Utils.sanitizeUsername(account.displayName ?? account.username)}: ${account.careerVP ? account.careerVP.toLocaleString() : "Unknown"} VP`;
            }

            const totalPlayers = await AccountData.count();
            const totalVP = await AccountData.getSumOfField("careerVP");

            const embed = new EmbedBuilder()
                .setColor("#dd33bb")
                .setDescription(string)
                .setFooter({ text: Locale.text(interaction, "LEADERBOARD_VP_FOOTER", [totalPlayers.toLocaleString(), totalVP.toLocaleString()]) })
                .setTimestamp()
            
            const previousButton = new ButtonBuilder()
                .setCustomId(`leaderboard/vp/${limit}/${offset - limit}`)
                .setDisabled(offset === 0 || accounts.length === 0)
                .setStyle(ButtonStyle.Primary)
                .setLabel(Locale.text(interaction, "PREVIOUS"))
            
            const nextButton = new ButtonBuilder()
                .setCustomId(`leaderboard/vp/${limit}/${offset + limit}`)
                .setDisabled(accounts.length !== limit)
                .setStyle(ButtonStyle.Primary)
                .setLabel(Locale.text(interaction, "NEXT"))
                 
            const row = new ActionRowBuilder()
                .addComponents(previousButton, nextButton)

            if (interaction.isMessageComponent()) return await interaction.editReply({ embeds: [embed], components: [row] });
            return { embeds: [embed], components: [row] };
        }
        if (subcommand == "activity") {
            const limit = Math.min(this.getIntegerArgument(interaction, "limit", 2), 50) || 25;
            const offset = Math.max(this.getIntegerArgument(interaction, "offset", 3), 0) || 0;
            const accounts = await AccountData.getTopActivity(limit, offset).toArray();
            
            if (!accounts.length)
                return Locale.text(interaction, "NO_MATCHES");
            
            let string = Locale.text(interaction, "TOP_PLAY_TIME");
            let i = 0 + offset;
            
            for (const account of accounts) {
                i += 1;
                string += `\n**${i}.** ${Utils.sanitizeUsername(account.displayName ?? account.username)}: ${Utils.formatSeconds(account.playTime)}`;
            }

            const totalPlayers = await AccountData.count();
            const totalPlayTime = await AccountData.getSumOfField("playTime");

            const embed = new EmbedBuilder()
                .setColor("#bb33dd")
                .setDescription(string)
                .setFooter({ text: Locale.text(interaction, "LEADERBOARD_ACTIVITY_FOOTER", [totalPlayers.toLocaleString(), Utils.formatSeconds(totalPlayTime)]) })
                .setTimestamp()
            
            const previousButton = new ButtonBuilder()
                .setCustomId(`leaderboard/activity/${limit}/${offset - limit}`)
                .setDisabled(offset === 0 || accounts.length === 0)
                .setStyle(ButtonStyle.Primary)
                .setLabel(Locale.text(interaction, "PREVIOUS"))
            
            const nextButton = new ButtonBuilder()
                .setCustomId(`leaderboard/activity/${limit}/${offset + limit}`)
                .setDisabled(accounts.length !== limit)
                .setStyle(ButtonStyle.Primary)
                .setLabel(Locale.text(interaction, "NEXT"))
                 
            const row = new ActionRowBuilder()
                .addComponents(previousButton, nextButton)

            if (interaction.isMessageComponent()) return await interaction.editReply({ embeds: [embed], components: [row] });
            return { embeds: [embed], components: [row] };
        }
        return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
    }
}

export default LeaderboardInteraction;