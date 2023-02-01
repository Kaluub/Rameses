import DefaultInteraction from "../classes/defaultInteraction.js";
import { AccountData } from "../classes/data.js";
import { formatSeconds, sanitizeUsername } from "../utils.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
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
        const username = interaction.options.getString("username");
        const account = await AccountData.getByUsername(username, false);

        if (!account) return Locale.text(interaction, "PLAYER_NOT_FOUND");
        if (!account.playTime) return Locale.text(interaction, "PLAYER_INACTIVE", [sanitizeUsername(account.displayName ?? account.username)]);

        // Customize the graph for fun (perhaps create generic graph function later if needed)
        const barValue = interaction.options.getString("graph-icon") || "▒";
        const detail = barValue.length > 1 ? Math.min(interaction.options.getInteger("graph-detail"), 40) || 30 : interaction.options.getInteger("graph-detail") || 30;
        const highestValue = Math.max(...Object.values(account.activity));

        let string = `${Locale.text(interaction, "TIME_PLAYED")}: ${formatSeconds(account.playTime)} (#${await AccountData.count({ "playTime": { "$gte": account.playTime } })}, top ${(await AccountData.count({ "playTime": { "$gte": account.playTime } }) / await AccountData.count({ "playTime": { "$gte": 0 } }) * 100).toFixed(5)}%)\n${Locale.text(interaction, "ACTIVITY_FORMAT")}\n`;
        string += "```";
        for (let h = 0; h < 24; h++) {
            const hour = h.toString();
            const value = account.activity[hour] ?? 0;
            const width = Math.floor(value / highestValue * detail);
            string += `\n${hour.length == 1 ? `0${hour}` : hour} | ${barValue.repeat(width)}`;
        }
        string += "```";

        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "ACTIVITY_TITLE", [sanitizeUsername(account.displayName ?? account.username)]))
            .setColor("#224488")
            .setTimestamp()
            .setDescription(string)

        return { embeds: [embed] };
    }
}

export default ActivityInteraction;