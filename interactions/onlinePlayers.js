import DefaultInteraction from "../defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder } from "discord.js";

const staff = [
    "MiceLee", "Stovoy", "Mrnibbles", "DDBus", "PotaroNuke", // Developer role
    "extirpater", "Exoriz", "Jackal", // Head mods
    // This is where Sr. mods would go, if any existed
    "Dittoblob", "Gianni", "LightY", "Bluemonkey14", "nosok", "Koraii", "⚝Simba⚝", "Darklight", "R0YqL", "Raqzv", "asdfasdfasdf1234",
    "Vikenti", "Mel", "«Ƥħǿēƞɨx»", "Amasterclasher", // Mods
    "hula", "Ram", "basti", "Androoh", "lindsay", "ThatHodgeGuy", "Kaluub", "Zxynn", "Angel🌸" // Jr mods
]

function sortUsernamesAlphabetically(username1, username2) {
    return username1.localeCompare(username2);
}

function sanitizeUsername(username) {
    return username
        .replaceAll("_", "\\_")
        .replaceAll("*", "\\*")
        .replaceAll("|", "\\|")
        .replaceAll("`", "\\`")
}

class OnlinePlayersInteraction extends DefaultInteraction {
    static name = "online-players";
    static applicationCommand = new SlashCommandBuilder()
        .setName(OnlinePlayersInteraction.name)
        .setDescription("See the currently online players")

    constructor() {
        super(OnlinePlayersInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const onlinePlayers = await interaction.client.evadesAPI.getOnlinePlayers();
        if(!onlinePlayers) return "Couldn't connect to Evades!";
        if(!onlinePlayers.length) return "No players are online!";

        const onlineStaff = [];
        const onlineRegistered = [];
        const onlineGuests = []
        for(const username of onlinePlayers) {
            if(username.startsWith("Guest")) {
                if(onlineGuests.join("; ").length > 1000) continue;
                onlineGuests.push(username);
                continue;
            }
            if(staff.includes(username)) {
                if(onlineStaff.join("; ").length > 1000) continue;
                onlineStaff.push(sanitizeUsername(username));
                continue;
            }
            if(onlineRegistered.join("; ").length > 1000) continue;
            onlineRegistered.push(sanitizeUsername(username))
        }

        onlineStaff.sort(sortUsernamesAlphabetically);
        onlineRegistered.sort(sortUsernamesAlphabetically);
        onlineGuests.sort(sortUsernamesAlphabetically);

        const embed = new EmbedBuilder()
            .setTitle("Players currently online:")
            .setColor("#11aa33")
            .setTimestamp()
            .setFooter({text: `${onlinePlayers.length} players online`})
        
        if(onlineStaff.length) embed.addFields({name: "Online staff:", value: onlineStaff.join("; ") || "None!"});
        if(onlineRegistered.length) embed.addFields({name: "Online players:", value: onlineRegistered.join("; ") || "None!"});
        if(onlineGuests.length) embed.addFields({name: "Online guests:", value: onlineGuests.join("; ") || "None!"});
        
        return { embeds: [embed] }
    }
}

export default OnlinePlayersInteraction;