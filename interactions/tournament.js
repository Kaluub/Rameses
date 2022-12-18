import DefaultInteraction from "../defaultInteraction.js";
import { ActionRowBuilder, InteractionType, ModalBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Config from "../config.js";
import { DiscordGuildData } from "../classes/data.js";
import Locale from "../classes/locale.js";

class TournamentInteraction extends DefaultInteraction {
    static name = "tournament";
    static applicationCommand = new SlashCommandBuilder()
        .setName(TournamentInteraction.name)
        .setDescription("Tournament related commands.")
        .setDMPermission(false)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("create")
                .setDescription("Create a new tournament.")
        )

    constructor() {
        super(TournamentInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false);
        if(subcommand == "create") {
            if(!interaction.guild) return Locale.text(interaction, "GUILD_ONLY");
            const guildData = await DiscordGuildData.getByID(interaction.guild.id);
            if(!interaction.member.roles.cache.hasAny(guildData.tournamentOrganizerRole, ...Config.TOURNAMENT_ORGANIZER_ROLES)) return Locale.text(interaction, "TOURNAMENT_ORGANIZERS_ONLY");
            const modal = new ModalBuilder()
                .setCustomId("tournament-create")
                .setTitle(Locale.text(interaction, "CREATE_TOURNAMENT"))
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("attempts")
                                .setLabel(Locale.text(interaction, "ATTEMPTS"))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setPlaceholder(Locale.text(interaction, "ATTEMPTS_DESCRIPTION"))
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("duration")
                                .setLabel(Locale.text(interaction, "DURATION"))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setPlaceholder(Locale.text(interaction, "DURATION_DESCRIPTION"))
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("topFormat")
                                .setLabel(Locale.text(interaction, "TOP_FORMAT"))
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(false)
                                .setPlaceholder(Locale.text(interaction, "TOP_FORMAT_DESCRIPTION"))
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("bottomFormat")
                                .setLabel(Locale.text(interaction, "BOTTON_FORMAT"))
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(false)
                                .setPlaceholder(Locale.text(interaction, "BOTTON_FORMAT_DESCRIPTION"))
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("type")
                                .setLabel(Locale.text(interaction, "TYPE"))
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setPlaceholder(Locale.text(interaction, "TYPE_DESCRIPTION"))
                        )
                )
            await interaction.showModal(modal);
        }
        return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
    }
}

export default TournamentInteraction;
