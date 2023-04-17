import DefaultInteraction from "../classes/defaultInteraction.js";
import { AccountData } from "../classes/data.js";
import Utils from "../classes/utils.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import Locale from "../classes/locale.js";
import EvadesData from "../classes/evadesData.js";

const emojiHats = {
    "autumn-wreath": "<:autumnwreath:1045570375788019793>",
    "blue-flames": "<:blueflames:1045570376962420827>",
    "blue-santa-hat": "<:bluesantahat:1045570378333966417>",
    "bronze-crown": "<:bronzecrown:1045570379248312400>",
    "flames": "<:flames:1045570379760025702>",
    "gold-crown": "<:goldcrown:1045570380846350418>",
    "gold-wreath": "<:goldwreath:1045570382259822633>",
    "halo": "<:halo:1045570383274852412>",
    "olympics-wreath": "<:olympicswreath:1045570383916576769>",
    "orbit-ring": "<:orbitring:1045570385061621760>",
    "santa-hat": "<:santahat:1045570386240229406>",
    "silver-crown": "<:silvercrown:1045570387024564306>",
    "spring-wreath": "<:springwreath:1045570388207341658>",
    "stars": "<:starshat:1045570388874244107>",
    "sticky-coat": "<:stickycoat:1045570390015086753>",
    "summer-wreath": "<:summerwreath:1045570390493241405>",
    "toxic-coat": "<:toxiccoat:1045570392082886746>",
    "winter-wreath": "<:winterwreath:1045570392921743391>"
}

function getHatEmojis(accessories) {
    // Does not work in external servers due to Discord limitations.
    // If it works later, will be re-enabled.
    let string = ""
    for (const hatName in accessories) {
        if (accessories[hatName] && emojiHats[hatName])
            string += emojiHats[hatName] ?? "";
    }
    return string;
}

function getAccessoryName(name) {
    const segments = name.split("-");
    const nameArray = [];
    for (const segment of segments) {
        nameArray.push(segment[0].toUpperCase() + segment.slice(1));
    }
    return nameArray.join(" ");
}

function getVictoryZonesTouched(stats) {
    // Does not work as originally intended.
    // Will use achievement records later instead.
    let updates = stats.version_number;
    for (const areaName in stats.highest_area_achieved) {
        updates -= stats?.highest_area_achieved[areaName] ?? 0;
    }
    return updates;
}

class PlayerInfoInteraction extends DefaultInteraction {
    static name = "player-info";
    static applicationCommand = new SlashCommandBuilder()
        .setName(PlayerInfoInteraction.name)
        .setDescription("Get certain details from a player")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("username")
                .setDescription("The username of the player")
                .setAutocomplete(true)
                .setRequired(true)
        )

    constructor() {
        super(PlayerInfoInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const username = this.getStringArgument(interaction, "username", 1);
        if (!username)
            return Locale.text(interaction, "COMMAND_ERROR");
        
        const playerDetails = await interaction.client.evadesAPI.getPlayerDetails(username);
        const onlinePlayers = await interaction.client.evadesAPI.getOnlinePlayers() ?? [];
        
        if (!playerDetails)
            return Locale.text(interaction, "PLAYER_NOT_FOUND");
        
        const account = await AccountData.getByUsername(username);
        const higherVP = await AccountData.count({ "careerVP": { "$gte": account.careerVP } });
        const higherPlaytime = await AccountData.count({ "playTime": { "$gte": account.playTime } });
        
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "PLAYER_DETAILS_TITLE", [Utils.sanitizeUsername(account?.displayName ?? username)]))
            .setURL(encodeURI("https://evades.io/profile/" + account?.displayName ?? username))
            .setColor("#884422")
            .setTimestamp()
            .setDescription(
                `**${Locale.text(interaction, "CAREER_VP")}**: ${playerDetails.stats["highest_area_achieved_counter"]} ${Locale.text(interaction, "VICTORY_POINTS")}${account.careerVP ? ` (#${higherVP}, top ${(higherVP / await AccountData.count() * 100).toFixed(5)}%)` : ""}${playerDetails.stats["highest_area_achieved_counter"] != playerDetails.summedCareerVP ? `\n**${Locale.text(interaction, "REAL_CAREER_VP")}**: ${playerDetails.summedCareerVP} ${Locale.text(interaction, "VICTORY_POINTS")}` : ""}
**${Locale.text(interaction, "WEEKLY_VP")}**: ${playerDetails.stats["highest_area_achieved_resettable_counter"] > 0 ? playerDetails.stats["highest_area_achieved_resettable_counter"] + ` ${Locale.text(interaction, "VICTORY_POINTS")}` : Locale.text(interaction, "NONE")}
**${Locale.text(interaction, "TIME_PLAYED")}**: ${account.playTime ? `${Utils.formatSeconds(account.playTime)} (#${higherPlaytime}, top ${(higherPlaytime / await AccountData.count({ "playTime": { "$gte": 0 } }) * 100).toFixed(5)}%)` : Locale.text(interaction, "NEVER")}
**${Locale.text(interaction, "ACCOUNT_AGE")}**: <t:${Math.floor(playerDetails.createdAt)}> (<t:${Math.floor(playerDetails.createdAt)}:R>)
**${Locale.text(interaction, "LAST_SEEN")}**: ${onlinePlayers.some(name => name.toLowerCase() == username.toLowerCase()) ? Locale.text(interaction, "ONLINE_NOW") : account.lastSeen ? `<t:${account.lastSeen}> (<t:${account.lastSeen}:R>)` : Locale.text(interaction, "NEVER")}
**${Locale.text(interaction, "WEEKS_ACTIVE")}**: ${playerDetails.activeWeeks} ${Locale.text(interaction, "WEEKS_UNIT")}${playerDetails.firstActiveWeekNumber ? `
**${Locale.text(interaction, "FIRST_ACTIVE_WEEK")}**: ${Locale.text(interaction, "WEEK")} ${playerDetails.firstActiveWeekNumber}
**${Locale.text(interaction, "LAST_ACTIVE_WEEK")}**: ${Locale.text(interaction, "WEEK")} ${playerDetails.lastActiveWeekNumber}
**${Locale.text(interaction, "BEST_WEEK")}**: ${Locale.text(interaction, "WEEK")} ${playerDetails.highestWeek[0]} ${Locale.text(interaction, "WITH")} ${playerDetails.highestWeek[1]} ${Locale.text(interaction, "VICTORY_POINTS")}${playerDetails.highestWeek[2] ? ` (${getAccessoryName(playerDetails.highestWeek[2])} Crown)` : ""}` : ""}
**${Locale.text(interaction, "CURRENT_HAT")}**: ${playerDetails.accessories["hat_selection"] ? getAccessoryName(playerDetails.accessories["hat_selection"]) : Locale.text(interaction, "NONE")}
**${Locale.text(interaction, "CURRENT_BODY")}**: ${playerDetails.accessories["body_selection"] ? getAccessoryName(playerDetails.accessories["body_selection"]) : Locale.text(interaction, "NONE")}
**${Locale.text(interaction, "ACHIEVEMENT_PROGRESS")}**: ${playerDetails.stats.achievements.length}/${EvadesData.achievements} (${(playerDetails.stats.achievements.length / EvadesData.achievements * 100).toFixed(2)}%)
**Hat collection**: ${hasPermission(interaction, PermissionsBitField.Flags.UseExternalEmojis) ? getHatEmojis(playerDetails.accessories.hat_collection) : "No emoji permissions!"}`
        )

        const activityButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("activity/" + account?.displayName ?? username)
            .setLabel(Locale.text(interaction, "ACTIVITY"))
        
        const profilePageButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(encodeURI("https://evades.io/profile/" + account?.displayName ?? username))
            .setLabel(Locale.text(interaction, "ACCOUNT_PAGE"))
            
        const row = new ActionRowBuilder()
            .addComponents(activityButton, profilePageButton)

        return { embeds: [embed], components: [row] }
    }
}

export default PlayerInfoInteraction;
