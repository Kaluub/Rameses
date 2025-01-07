import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from "discord.js";
import Utils from "../classes/utils.js";
import Config from "../classes/config.js";
import { DiscordGuildData, TournamentData } from "../classes/data.js";
import Locale from "../classes/locale.js";

class TournamentManageInteraction extends DefaultInteraction {
    static name = "tournament-manage";

    constructor() {
        super(TournamentManageInteraction.name, [InteractionType.ModalSubmit, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        if (!interaction.guild) {
            return Locale.text(interaction, "GUILD_ONLY");
        }

        const guildData = await DiscordGuildData.getByID(interaction.guild.id);

        if (!interaction.member.roles.cache.hasAny(
            guildData.tournamentOrganizerRole,
            ...Config.TOURNAMENT_ORGANIZER_ROLES)) {
            return { content: Locale.text(interaction, "TOURNAMENT_ORGANIZERS_ONLY"), ephemeral: true };
        }

        if (interaction.isMessageComponent() && interaction.customId === TournamentManageInteraction.name) {
            // Base interface
            const tournament = await TournamentData.getByID(interaction.message.id);
            if (!tournament) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), ephemeral: true };
            }
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`tournament-manage/remove/${tournament.id}/${interaction.channel.id}`)
                        .setLabel("Remove runs from a username")
                        .setStyle(ButtonStyle.Danger)
                )
            return { content: "Tournament Organizer Tools", ephemeral: true, components: [row] };
        } else if (interaction.isMessageComponent()) {
            const args = interaction.customId.split("/");
            if (args[1] === "remove") {
                // Remove runs from a username
                const modal = new ModalBuilder()
                    .setCustomId(`tournament-manage/remove/${args[2]}/${args[3]}`)
                    .setTitle("Remove runs")
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setCustomId("username")
                                    .setLabel("Username")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                                    .setPlaceholder("The username to remove all runs from (they will be saved for you)")
                            )
                    )
                await interaction.showModal(modal);
            }
        } else if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });
            const args = interaction.customId.split("/");
            const tournament = await TournamentData.getByID(args[2]);
            if (!tournament) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), ephemeral: true };
            }

            const username = interaction.fields.getTextInputValue("username").trim().normalize();
            const removedRuns = tournament.leaderboard.filter(entry => entry.player === username);
            if (removedRuns.length <= 0) {
                return { content: `No runs from "${username}" are present.`, ephemeral: true };
            }
            tournament.leaderboard = tournament.leaderboard.filter(entry => entry.player !== username);
            await tournament.save();

            const channel = interaction.client.channels.cache.get(args[3]);
            if (!channel) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), ephemeral: true };
            }
            const message = await channel.messages.fetch(tournament.id);
            if (!message) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), ephemeral: true };
            }
            if (!message.editable) {
                return { content: Locale.text(interaction, "TOURNAMENT_ERROR"), ephemeral: true };
            }
            await message.edit({ content: Utils.tournamentFormatter(tournament) });
            let result =
`Removed runs from ${username} successfully.
List of removed runs:`;
            for (const run of removedRuns) {
                result += `\n- ${run.area} in ${run.time} (spectated by <@${run.spectator}>)`
            }
            return { content: result, ephemeral: true };
        }
    }
}

export default TournamentManageInteraction;