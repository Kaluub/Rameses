import DefaultInteraction from "../defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder } from "discord.js";
import { sanitizeUsername } from "../utils.js";
import { DiscordUserData } from "../data.js";
import Locale from "../locale.js";

const staff = [
    "MiceLee", "Stovoy", "Mrnibbles", "DDBus", "PotaroNuke", // Developer role
    "extirpater", "Exoriz", "Jackal", // Head mods
    // This is where Sr. mods would go, if any existed.
    "Dittoblob", "Gianni", "LightY", "Bluemonkey14", "nosok", "Koraiii", "⚝Simba⚝", "Darklight", "R0YqL", "Raqzv", "asdfasdfasdf1234",
    "Vikenti", "Mel", "«Ƥħǿēƞɨx»", "Amasterclasher", "Invi", // Mods
    "hula", "Ram", "basti", "Androoh", "lindsay", "ThatHodgeGuy", "Kaluub", "Zxynn", "Angel🌸" // Jr mods
]

function sortUsernamesAlphabetically(username1, username2) {
    return username1.localeCompare(username2);
}

const JOINER = "; ";
const MAX_CHARACTER_COUNT = 1000;

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
        if(!onlinePlayers) return Locale.text(interaction, "EVADES_ERROR");
        if(!onlinePlayers.length) return Locale.text(interaction, "NOBODY_ONLINE");

        const userData = await DiscordUserData.getByID(interaction.user.id);

        const onlineFriends = [];
        const onlineStaff = [];
        const onlineRegistered = [];
        const onlineGuests = [];
        for(const username of onlinePlayers) {
            // Filter guests into their own category first.
            if(username.startsWith("Guest")) {
                if((onlineGuests.join(JOINER) + `${JOINER}${username}`).length > MAX_CHARACTER_COUNT) continue;
                onlineGuests.push(username);
                continue;
            }
            // Friends are next priority (you can't befriend a guest, sadly. Social norms, man)
            if(userData.friends.includes(username.toLowerCase())) {
                const nextFriend = sanitizeUsername(username);
                if((onlineFriends.join(JOINER) + `${JOINER}${nextFriend}`).length > MAX_CHARACTER_COUNT) continue;
                onlineFriends.push(nextFriend);
                continue;
            }
            // Put any staff members in a separate category
            if(staff.includes(username)) {
                const nextStaff = sanitizeUsername(username);
                if((onlineStaff.join(JOINER) + `${JOINER}${nextStaff}`).length > MAX_CHARACTER_COUNT) continue;
                onlineStaff.push(nextStaff);
                continue;
            }
            // Handle anyone else not in the above conditions
            const nextRegistered = sanitizeUsername(username);
            if((onlineRegistered.join(JOINER) + `${JOINER}${nextRegistered}`).length > MAX_CHARACTER_COUNT) continue;
            onlineRegistered.push(nextRegistered);
        }

        onlineFriends.sort(sortUsernamesAlphabetically);
        onlineStaff.sort(sortUsernamesAlphabetically);
        onlineRegistered.sort(sortUsernamesAlphabetically);
        onlineGuests.sort(sortUsernamesAlphabetically);

        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "PLAYERS_ONLINE"))
            .setColor("#11aa33")
            .setTimestamp()
            .setFooter({text: Locale.text(interaction, "PLAYERS_ONLINE_COUNT", [onlinePlayers.length])})
        
        // Put them all on display.
        if(onlineFriends.length) embed.addFields({name: Locale.text(interaction, "ONLINE_FRIENDS"), value: onlineFriends.join(JOINER) || "None!"});
        if(onlineStaff.length) embed.addFields({name: Locale.text(interaction, "ONLINE_STAFF"), value: onlineStaff.join(JOINER) || "None!"});
        if(onlineRegistered.length) embed.addFields({name: Locale.text(interaction, "ONLINE_PLAYERS"), value: onlineRegistered.join(JOINER) || "None!"});
        if(onlineGuests.length) embed.addFields({name: Locale.text(interaction, "ONLINE_GUESTS"), value: onlineGuests.join(JOINER) || "None!"});
        
        return { embeds: [embed] }
    }
}

export default OnlinePlayersInteraction;
