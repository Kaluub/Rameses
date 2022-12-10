import DefaultInteraction from "../defaultInteraction.js";
import { ActionRowBuilder, InteractionType, ModalBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Config from "../config.js";

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
            if(!interaction.member) return "Please use this in the Discord server.";
            if(!interaction.member.roles.cache.hasAny(...Config.TOURNAMENT_ORGANIZER_ROLES)) return "You need to be a Tournament Organizer to use this tool!";
            const modal = new ModalBuilder()
                .setCustomId("tournament-create")
                .setTitle("Create tournament")
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("team-size")
                                .setLabel("Team size:")
                                .setMaxLength(1)
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setPlaceholder("Default: 1 (solo)")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("attempts")
                                .setLabel("Attempts:")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setPlaceholder("Default: 3 (three attempts)")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("duration")
                                .setLabel("Tournament duration:")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setPlaceholder("Default: 7 (seven days)")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("format")
                                .setLabel("Custom format:")
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(false)
                                .setPlaceholder("Default: [{position}] [{player}]\\n{area} ;; {time} ;; {attempt}")
                        )
                )
            await interaction.showModal(modal);
        }
        return "How did we get here?";
    }
}

export default TournamentInteraction;