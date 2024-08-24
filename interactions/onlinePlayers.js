import DefaultInteraction from "../classes/defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import Utils from "../classes/utils.js";
import { DiscordUserData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import EvadesData from "../classes/evadesData.js";

function sortUsernamesAlphabetically(username1, username2) {
    return username1.localeCompare(username2);
}

const JOINER = "; ";
const MAX_CHARACTER_COUNT = 1000;

const serverChoices = [
    { name: "all of NA", value: "na" },
    { name: "all of EU", value: "eu" },
    { name: "NA 1", value: "na:0" },
    { name: "NA 2", value: "na:1" },
    { name: "NA 3", value: "na:2" },
    { name: "NA 4", value: "na:3" },
    { name: "NA 5", value: "na:4" },
    { name: "NA 6", value: "na:5" },
    { name: "NA 7", value: "na:6" },
    { name: "NA 8", value: "na:7" },
    { name: "EU 1", value: "eu:0" },
    { name: "EU 2", value: "eu:1" },
    { name: "EU 3", value: "eu:2" },
    { name: "EU 4", value: "eu:3" },
    { name: "EU 5", value: "eu:4" },
    { name: "EU 6", value: "eu:5" },
    { name: "EU 7", value: "eu:6" },
    { name: "EU 8", value: "eu:7" }
]

class OnlinePlayersInteraction extends DefaultInteraction {
    static name = "online-players";
    static applicationCommand = new SlashCommandBuilder()
        .setName(OnlinePlayersInteraction.name)
        .setDescription("See the currently online players")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("server")
                .setDescription("The server to fetch the players from.")
                .setRequired(false)
                .setChoices(...serverChoices)
        )

    constructor() {
        super(OnlinePlayersInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        let onlinePlayers;
        const specificServer = interaction?.options?.getString("server");

        if (specificServer) {
            const data = specificServer.split(":");
            const location = data[0];
            const index = data[1];

            if (!location) return Locale.text(interaction, "INVALID_SERVER");
            if (!["na", "eu"].includes(location)) return Locale.text(interaction, "INVALID_SERVER");

            const serverStats = await interaction.client.evadesAPI.getServerStats();

            if (index === undefined) {
                const servers = location === "na" ? serverStats.na : serverStats.eu;
                onlinePlayers = [];
                console.log(servers);
                for (const server of Object.values(servers)) {
                    onlinePlayers.push(...server.online);
                }
            }

            else if (location === "na") {
                if (!serverStats.na[index]) return Locale.text(interaction, "INVALID_SERVER");
                onlinePlayers = serverStats.na[index].online;
            }

            else if (location === "eu") {
                if (!serverStats.eu[index]) return Locale.text(interaction, "INVALID_SERVER");
                onlinePlayers = serverStats.eu[index].online;
            }
        }

        if (!onlinePlayers) {
            onlinePlayers = await interaction.client.evadesAPI.getOnlinePlayers();
        }
        if (!onlinePlayers) {
            return Locale.text(interaction, "EVADES_ERROR");
        }

        const userData = await DiscordUserData.getByID(interaction.user.id);

        const onlineFriends = [];
        const onlineStaff = [];
        const onlineRegistered = [];
        const onlineGuests = [];

        for (const username of onlinePlayers) {
            // Filter guests into their own category first.
            if (username.startsWith("Guest")) {
                if ((onlineGuests.join(JOINER) + `${JOINER}${username}`).length > MAX_CHARACTER_COUNT)
                    continue;
                onlineGuests.push(username);
                continue;
            }
            // Friends are next priority.
            if (userData.friends.includes(username.toLowerCase())) {
                const nextFriend = Utils.sanitizeUsername(username);
                if ((onlineFriends.join(JOINER) + `${JOINER}${nextFriend}`).length > MAX_CHARACTER_COUNT)
                    continue;
                onlineFriends.push(nextFriend);
                continue;
            }
            // Put any staff members in a separate category.
            if (EvadesData.staff.includes(username)) {
                const nextStaff = Utils.sanitizeUsername(username);
                if ((onlineStaff.join(JOINER) + `${JOINER}${nextStaff}`).length > MAX_CHARACTER_COUNT)
                    continue;
                onlineStaff.push(nextStaff);
                continue;
            }
            // Handle anyone else not in the above conditions.
            const nextRegistered = Utils.sanitizeUsername(username);
            if ((onlineRegistered.join(JOINER) + `${JOINER}${nextRegistered}`).length > MAX_CHARACTER_COUNT)
                continue;
            onlineRegistered.push(nextRegistered);
        }

        onlineFriends.sort(sortUsernamesAlphabetically);
        onlineStaff.sort(sortUsernamesAlphabetically);
        onlineRegistered.sort(sortUsernamesAlphabetically);
        onlineGuests.sort(sortUsernamesAlphabetically);

        const embed = new EmbedBuilder()
            .setTitle(
                specificServer ?
                    Locale.text(interaction, "PLAYERS_ONLINE_IN_SERVER", [serverChoices.find(choice => choice.value == specificServer)?.name]) :
                    Locale.text(interaction, "PLAYERS_ONLINE")
            )
            .setColor("#11aa33")
            .setTimestamp()
            .setFooter({ text: Locale.text(interaction, "PLAYERS_ONLINE_COUNT", [onlinePlayers.length]) })

        // Put them all on display.
        if (onlineFriends.length)
            embed.addFields({ name: Locale.text(interaction, "ONLINE_FRIENDS"), value: onlineFriends.join(JOINER) || "None!" });
        if (onlineStaff.length)
            embed.addFields({ name: Locale.text(interaction, "ONLINE_STAFF"), value: onlineStaff.join(JOINER) || "None!" });
        if (onlineRegistered.length)
            embed.addFields({ name: Locale.text(interaction, "ONLINE_PLAYERS"), value: onlineRegistered.join(JOINER) || "None!" });
        if (onlineGuests.length)
            embed.addFields({ name: Locale.text(interaction, "ONLINE_GUESTS"), value: onlineGuests.join(JOINER) || "None!" });

        // Handle case where nobody is online.
        if (!(onlineFriends.length || onlineStaff.length || onlineRegistered.length || onlineGuests.length))
            embed.addFields({ name: Locale.text(interaction, "ONLINE_PLAYERS"), value: Locale.text(interaction, "NOBODY_ONLINE") });

        return { embeds: [embed] }
    }
}

export default OnlinePlayersInteraction;
