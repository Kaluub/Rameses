import DefaultInteraction from "../defaultInteraction.js";
import { AccountData } from "../data.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

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
                .setRequired(true)
        )

    constructor() {
        super(PlayerInfoInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const username = interaction.options.getString("username");
        const account = await AccountData.getByUsername(username);
        const playerDetails = await interaction.client.evadesAPI.getPlayerDetails(username);
        const onlinePlayers = await interaction.client.evadesAPI.getOnlinePlayers();
        if(!playerDetails) return "The player could not be found!";
        const embed = new EmbedBuilder()
            .setTitle(`Details about ${account?.displayName ?? username}:`)
            .setURL(`https://evades.io/profile/${account?.displayName ?? username}`)
            .setColor("#884422")
            .setTimestamp()
            .setDescription(
`**Career VP**: ${playerDetails.stats["highest_area_achieved_counter"] + " VP"}${playerDetails.stats["highest_area_achieved_counter"] != playerDetails.summedCareerVP ? `\n**Sum of weeks VP**: ${playerDetails.summedCareerVP} VP` : ""}
**VP this week**: ${playerDetails.stats["highest_area_achieved_resettable_counter"] > 0 ? playerDetails.stats["highest_area_achieved_resettable_counter"] + " VP" : "None"}
**Last seen**: ${onlinePlayers.some(name => name.toLowerCase() == username.toLowerCase()) ? "Online now!" : account.lastSeen ? `<t:${account.lastSeen}> (<t:${account.lastSeen}:R>)` : "Never"}
**Victory zones reached**: ${getVictoryZonesTouched(playerDetails.stats)} victory zones
**Weeks active**: ${playerDetails.activeWeeks} weeks
**First active week**: Week ${playerDetails.firstActiveWeekNumber}
**Last active week**: Week ${playerDetails.lastActiveWeekNumber}
**Best week**: Week ${playerDetails.highestWeek[0]} with ${playerDetails.highestWeek[1]} VP${playerDetails.highestWeek[2] ? ` (${getHatName(playerDetails.highestWeek[2])} Crown)` : ""}
**Current hat**: ${playerDetails.accessories["hat_selection"] ? getHatName(playerDetails.accessories["hat_selection"]) : "None"}`
//**Hat collection**: ${getHatEmojis(playerDetails.accessories.hat_collection)}`
        )
        return { embeds: [embed] }
    }
}

export default PlayerInfoInteraction;