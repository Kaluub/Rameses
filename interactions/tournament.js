import DefaultInteraction from "../defaultInteraction.js";
import { ActionRowBuilder, InteractionType, ModalBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Config from "../config.js";
import { TournamentData } from "../data.js";

class TournamentInteraction extends DefaultInteraction {
    static name = "tournament";
    static applicationCommand = new SlashCommandBuilder()
        .setName(TournamentInteraction.name)
        .setDescription("Tournament related commands.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("create")
                .setDescription("Create a new tournament.")
        )

    constructor() {
        super(TournamentInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false)
        if(subcommand == "create") {
            if(!interaction.member) return "Please use this in the Discord server.";
            await interaction.member.roles.fetch();
            if(!interaction.member.roles.cache.has(Config.TOURNAMENT_ORGANIZER_ROLE) && !Config.DEBUG) return "You need to be a Tournament Organizer to use this tool!";
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
                                .setPlaceholder("Default: 1 (solo)")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("hero-amount")
                                .setLabel("Amount of heroes allowed:")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("Default: 1 (single hero tournament)")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("attempts")
                                .setLabel("Attempts:")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("Default: 3 (three attempts)")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("format")
                                .setLabel("Custom format:")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("Default: [{position}] [{player}]\\n{area} ;; {time} ;; {attempt}")
                        )
                )
            return await interaction.showModal(modal);
        }
        return "How did we get here?";
    }
}

export default TournamentInteraction;