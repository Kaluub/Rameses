import DefaultInteraction from "../defaultInteraction.js";
import { AccountData } from "../data.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

function getHatName(name) {
    const segments = name.split("-");
    const nameArray = [];
    for(const segment of segments) {
        nameArray.push(segment[0].toUpperCase() + segment.slice(1));
    }
    return nameArray.join(" ");
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
        if(!playerDetails) return "The player could not be found!";
        const embed = new EmbedBuilder()
            .setTitle(`Details about ${account?.displayName ?? username}:`)
            .setURL(`https://evades.io/profile/${account?.displayName ?? username}`)
            .setColor("#884422")
            .setTimestamp()
            .setDescription(
`**Career VP**: ${playerDetails.stats["highest_area_achieved_counter"]}${playerDetails.stats["highest_area_achieved_counter"] != playerDetails.summedCareerVP ? `\n**Sum of weeks VP**: ${playerDetails.summedCareerVP}` : ""}
**Current week VP**: ${playerDetails.stats["highest_area_achieved_resettable_counter"]}
**Last seen**: ${account.lastSeen ? `<t:${account.lastSeen}> (<t:${account.lastSeen}:R>)` : "Never"}
**Weeks active**: ${playerDetails.activeWeeks}
**First active week**: Week ${playerDetails.firstActiveWeekNumber}
**Last active week**: Week ${playerDetails.lastActiveWeekNumber}
**Best week**: Week ${playerDetails.highestWeek[0]} with ${playerDetails.highestWeek[1]} VP${playerDetails.highestWeek[2] ? ` (${getHatName(playerDetails.highestWeek[2])} Crown)` : ""}
**Current hat**: ${playerDetails.accessories["hat_selection"] ? getHatName(playerDetails.accessories["hat_selection"]) : "None"}`
        )
        return { embeds: [embed] }
    }
}

export default PlayerInfoInteraction;