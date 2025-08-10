import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import Utils from "../classes/utils.js";
import { DiscordUserData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import EvadesData from "../classes/evadesData.js";

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
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addStringOption(
            new SlashCommandStringOption()
                .setName("server")
                .setDescription("The server to fetch the players from.")
                .setRequired(false)
                .setAutocomplete(true)
        )

    constructor() {
        super(OnlinePlayersInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        let onlinePlayers;
        const specificServer = this.getStringArgument(interaction, "server", 1);
        let serverName = null;

        if (specificServer) {
            const data = specificServer.split(":");
            const location = data[0];
            const index = data[1];

            if (!location) return Locale.text(interaction, "INVALID_SERVER");
            if (!["na", "eu"].includes(location)) return Locale.text(interaction, "INVALID_SERVER");

            const serverStats = await interaction.client.evadesAPI.getServerStats();

            if (!serverStats) {
                return Locale.text(interaction, "EVADES_ERROR");
            }

            if (index === undefined) {
                const servers = location === "na" ? serverStats.na : serverStats.eu;
                onlinePlayers = [];
                for (const server of Object.values(servers)) {
                    onlinePlayers.push(...server.online);
                }
                serverName = `all of ${location.toUpperCase()}`;
            } else if (location === "na") {
                if (!serverStats.na[index]) return Locale.text(interaction, "INVALID_SERVER");
                onlinePlayers = serverStats.na[index].online;
            } else if (location === "eu") {
                if (!serverStats.eu[index]) return Locale.text(interaction, "INVALID_SERVER");
                onlinePlayers = serverStats.eu[index].online;
            }

            serverName ??= `${location.toUpperCase()} ${parseInt(index) + 1}`;
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
                    Locale.text(interaction, "PLAYERS_ONLINE_IN_SERVER", [serverName]) :
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

        let content = undefined;
        if (interaction.isMessageComponent()) {
            content = interaction.user.toString();
        }
        return { content, embeds: [embed] };
    }
}

export default OnlinePlayersInteraction;
