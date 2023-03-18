import DefaultInteraction from "../classes/defaultInteraction.js";
import { AccountData } from "../classes/data.js";
import Utils from "../classes/utils.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import Locale from "../classes/locale.js";

class ActivityInteraction extends DefaultInteraction {
    static name = "activity";
    static applicationCommand = new SlashCommandBuilder()
        .setName(ActivityInteraction.name)
        .setDescription("Get certain details from a player")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("username")
                .setDescription("The username of the player")
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("graph-icon")
                .setDescription("The icon used to represent the percentage of activity on the graph.")
                .setMaxLength(2)
                .setRequired(false)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("graph-detail")
                .setDescription("The amount of detail used to represent the percentage of activity on the graph.")
                .setMinValue(0)
                .setMaxValue(50)
                .setRequired(false)
        )

    constructor() {
        super(ActivityInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const username = this.getStringArgument(interaction, "username", 1);
        if (!username)
            return Locale.text(interaction, "COMMAND_ERROR");

        const account = await AccountData.getByUsername(username, false);

        if (!account) return Locale.text(interaction, "PLAYER_NOT_FOUND");
        if (!account.playTime) return Locale.text(interaction, "PLAYER_INACTIVE", [Utils.sanitizeUsername(account.displayName ?? account.username)]);

        // Customize the graph for fun (perhaps create generic graph function later if needed)
        const barValue = interaction.options?.getString("graph-icon") || "▒";
        const detail = barValue.length > 1 ? Math.min(interaction.options?.getInteger("graph-detail"), 40) || 30 : interaction.options?.getInteger("graph-detail") || 30;
        const highestValue = Math.max(...Object.values(account.activity));

        let string = `${Locale.text(interaction, "TIME_PLAYED")}: ${Utils.formatSeconds(account.playTime)} (#${await AccountData.count({ "playTime": { "$gte": account.playTime } })}, top ${(await AccountData.count({ "playTime": { "$gte": account.playTime } }) / await AccountData.count({ "playTime": { "$gte": 0 } }) * 100).toFixed(5)}%)\n${Locale.text(interaction, "ACTIVITY_FORMAT")}\n`;
        string += "```";
        for (let h = 0; h < 24; h++) {
            const hour = h.toString();
            const value = account.activity[hour] ?? 0;
            const width = Math.floor(value / highestValue * detail);
            string += `\n${hour.length == 1 ? `0${hour}` : hour} | ${barValue.repeat(width)}`;
        }
        string += "```";

        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "ACTIVITY_TITLE", [Utils.sanitizeUsername(account.displayName ?? account.username)]))
            .setColor("#224488")
            .setTimestamp()
            .setDescription(string)
        
        const playerInfoButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("player-info/" + account?.displayName ?? username)
            .setLabel(Locale.text(interaction, "PLAYER_INFO"))
        
        const profilePageButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(encodeURI("https://evades.io/profile/" + account?.displayName ?? username))
            .setLabel(Locale.text(interaction, "ACCOUNT_PAGE"))
            
        const row = new ActionRowBuilder()
            .addComponents(playerInfoButton, profilePageButton)

        return { embeds: [embed], components: [row] };
    }
}

export default ActivityInteraction;