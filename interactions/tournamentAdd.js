import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, MessageFlags } from "discord.js";
import Utils from "../classes/utils.js";
import Config from "../classes/config.js";
import { DiscordGuildData, TournamentData } from "../classes/data.js";
import Locale from "../classes/locale.js";

class TournamentAddInteraction extends DefaultInteraction {
    static name = "tournament-add";

    constructor() {
        super(TournamentAddInteraction.name, [InteractionType.ModalSubmit, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        if (!interaction.guild) {
            return Locale.text(interaction, "GUILD_ONLY");
        }

        const guildData = await DiscordGuildData.getByID(interaction.guild.id);

        if (!interaction.member.roles.cache.hasAny(
            guildData.tournamentSpectatorRole,
            guildData.tournamentOrganizerRole,
            ...Config.TOURNAMENT_SPECTATOR_ROLES,
            ...Config.TOURNAMENT_ORGANIZER_ROLES)) {
            return { content: Locale.text(interaction, "TOURNAMENT_SPECTATORS_ONLY"), flags: MessageFlags.Ephemeral };
        }

        if (interaction.isMessageComponent()) {
            const tournament = await TournamentData.getByID(interaction.message.id);
            if (!tournament) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), flags: MessageFlags.Ephemeral };
            }
            if (Date.now() > tournament.created + tournament.duration) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "TOURNAMENT_OVER") };
            }
            const modal = new ModalBuilder()
                .setCustomId(`tournament-add/${tournament.id}/${interaction.channel.id}`)
                .setTitle(Locale.text(interaction, "ADD_TOURNAMENT_RUN"))
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("player")
                                .setLabel(Locale.text(interaction, "PLAYERS"))
                                .setStyle(TextInputStyle.Short)
                                .setMaxLength(64)
                                .setRequired(true)
                                .setPlaceholder(Locale.text(interaction, "PLAYERS_DESCRIPTION"))
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("area")
                                .setLabel(Locale.text(interaction, "AREA"))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder(Locale.text(interaction, "AREA_DESCRIPTION"))
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("time")
                                .setLabel(Locale.text(interaction, "TIME"))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                                .setPlaceholder(Locale.text(interaction, "TIME_DESCRIPTION"))
                        )
                )
            return await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const args = interaction.customId.split("/");

            const tournament = await TournamentData.getByID(args[1]);
            if (!tournament) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), flags: MessageFlags.Ephemeral };
            }

            if (Date.now() > tournament.created + tournament.duration) {
                // Remove button or something later
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "TOURNAMENT_OVER") };
            }

            let player = interaction.fields.getTextInputValue("player").trim().normalize();
            let area = interaction.fields.getTextInputValue("area").toLowerCase().trim().normalize();
            let time = interaction.fields.getTextInputValue("time").trim().normalize();

            if (!player || !area || !time) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "INVALID_VALUES") };
            }

            if (player.length > 64) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "USERNAME_LONG") };
            }

            if (tournament.leaderboard.filter(r => player.toLowerCase() == r.player.toLowerCase()).length >= tournament.maxAttempts) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "ATTEMPTS_USED", Utils.sanitizeUsername(player)) };
            }

            const playerDetails = await interaction.client.evadesAPI.getPlayerDetails(player);
            if (!playerDetails && guildData.forceAccountExistence) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "PLAYER_NOT_FOUND") };
            }

            if (area.startsWith("area ")) {
                const aNumber = parseInt(area.split(" ")[1])
                if (isNaN(aNumber)) {
                    return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "AREA_IS_NAN") };
                }
                if (aNumber < 1) {
                    return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "AREA_IS_TOO_LOW") };
                }
            }
            if (!area.startsWith("area ") && area != "Victory!") {
                const aNumber = parseInt(area);
                if (!aNumber) {
                    return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "AREA_IS_NAN") };
                }
                if (aNumber < 1) {
                    return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "AREA_IS_TOO_LOW") };
                }
                area = `Area ${parseInt(area)}`;
            }
            if (area.startsWith("a")) {
                area = area.replace("a", "A");
            }

            let timeSegments = time.split(":");
            let timeSeconds = 0;
            if (timeSegments.length == 2) {
                if (timeSegments[1] > 59) {
                    return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "TIME_FORMAT_ERROR") };
                }
                timeSeconds += parseInt(timeSegments[0]) * 60 + parseInt(timeSegments[1]);
            } else {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "TIME_FORMAT_ERROR") };
            }
            if (isNaN(timeSeconds)) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "TIME_FORMAT_ERROR") };
            }
            if (timeSeconds < 0) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "NEGATIVE_TIME") };
            }

            if (tournament.leaderboard.length >= 10000) {
                return { flags: MessageFlags.Ephemeral, content: Locale.text(interaction, "TOURNAMENT_FULL") };
            }

            const formattedTime = Utils.formatSecondsToMinutes(timeSeconds);

            tournament.leaderboard.push({ player, area, time: formattedTime, timeSeconds, spectator: interaction.user.id });
            await tournament.save();

            const channel = interaction.client.channels.cache.get(args[2]);
            if (!channel) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), flags: MessageFlags.Ephemeral };
            }
            const message = await channel.messages.fetch(tournament.id);
            if (!message) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), flags: MessageFlags.Ephemeral };
            }
            if (!message.editable) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), flags: MessageFlags.Ephemeral };
            }
            await message.edit({ content: Utils.tournamentFormatter(tournament) });
            return { content: Locale.text(interaction, "TOURNAMENT_RUN_ADDED"), flags: MessageFlags.Ephemeral };
        }
    }
}

export default TournamentAddInteraction;