import DefaultInteraction from "../classes/defaultInteraction.js";
import { AccountData } from "../classes/data.js";
import { sanitizeUsername } from "../utils.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import Locale from "../classes/locale.js";

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
    let string = ""
    for(const hatName in accessories) {
        if(accessories[hatName] && emojiHats[hatName])
        string += emojiHats[hatName] ?? "";
    }
    return string;
}

function getHatName(name) {
    const segments = name.split("-");
    const nameArray = [];
    for(const segment of segments) {
        nameArray.push(segment[0].toUpperCase() + segment.slice(1));
    }
    return nameArray.join(" ");
}

function getVictoryZonesTouched(stats) {
    let updates = stats.version_number;
    for(const areaName in stats.highest_area_achieved) {
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
        const username = interaction.options.getString("username");
        const playerDetails = await interaction.client.evadesAPI.getPlayerDetails(username);
        const onlinePlayers = await interaction.client.evadesAPI.getOnlinePlayers();
        if(!playerDetails) return Locale.text(interaction, "PLAYER_NOT_FOUND");
        let account = await AccountData.getByUsername(username);
        account.careerVP = playerDetails.stats["highest_area_achieved_counter"];
        await account.save();
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "PLAYER_DETAILS_TITLE", [sanitizeUsername(account?.displayName ?? username)]))
            .setURL(`https://evades.io/profile/${account?.displayName ?? username}`)
            .setColor("#884422")
            .setTimestamp()
            .setDescription(
`**${Locale.text(interaction, "CAREER_VP")}**: ${playerDetails.stats["highest_area_achieved_counter"]} ${Locale.text(interaction, "VICTORY_POINTS")}${account.careerVP ? ` (#${await AccountData.count({"careerVP": {"$gte": account.careerVP}})}, top ${(await AccountData.count({"careerVP": {"$gt": account.careerVP}}) / await AccountData.count() * 100).toFixed(5)}%)` : ""}${playerDetails.stats["highest_area_achieved_counter"] != playerDetails.summedCareerVP ? `\n**${Locale.text(interaction, "REAL_CAREER_VP")}**: ${playerDetails.summedCareerVP} ${Locale.text(interaction, "VICTORY_POINTS")}` : ""}
**${Locale.text(interaction, "WEEKLY_VP")}**: ${playerDetails.stats["highest_area_achieved_resettable_counter"] > 0 ? playerDetails.stats["highest_area_achieved_resettable_counter"] + ` ${Locale.text(interaction, "VICTORY_POINTS")}` : Locale.text(interaction, "NONE")}
**${Locale.text(interaction, "LAST_SEEN")}**: ${onlinePlayers.some(name => name.toLowerCase() == username.toLowerCase()) ? Locale.text(interaction, "ONLINE_NOW") : account.lastSeen ? `<t:${account.lastSeen}> (<t:${account.lastSeen}:R>)` : Locale.text(interaction, "NEVER")}
**${Locale.text(interaction, "WEEKS_ACTIVE")}**: ${playerDetails.activeWeeks} ${Locale.text(interaction, "WEEKS_UNIT")}${playerDetails.firstActiveWeekNumber ? `\n**${Locale.text(interaction, "FIRST_ACTIVE_WEEK")}**: ${Locale.text(interaction, "WEEK")} ${playerDetails.firstActiveWeekNumber}
**${Locale.text(interaction, "LAST_ACTIVE_WEEK")}**: ${Locale.text(interaction, "WEEK")} ${playerDetails.lastActiveWeekNumber}
**${Locale.text(interaction, "BEST_WEEK")}**: ${Locale.text(interaction, "WEEK")} ${playerDetails.highestWeek[0]} ${Locale.text(interaction, "WITH")} ${playerDetails.highestWeek[1]} ${Locale.text(interaction, "VICTORY_POINTS")}${playerDetails.highestWeek[2] ? ` (${getHatName(playerDetails.highestWeek[2])} Crown)` : ""}` : ""}
**${Locale.text(interaction, "CURRENT_HAT")}**: ${playerDetails.accessories["hat_selection"] ? getHatName(playerDetails.accessories["hat_selection"]) : "None"}`
//**Hat collection**: ${hasPermission(interaction, PermissionsBitField.Flags.UseExternalEmojis) ? getHatEmojis(playerDetails.accessories.hat_collection) : "No emoji permissions!"}`
        )
        return { embeds: [embed] }
    }
}

export default PlayerInfoInteraction;
