import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } from "discord.js";
import { tournamentFormatter } from "../utils.js";
import Config from "../config.js";
import { DiscordGuildData, TournamentData } from "../classes/data.js";
import Locale from "../classes/locale.js";

class TournamentCreateInteraction extends DefaultInteraction {
    static name = "tournament-create";

    constructor() {
        super(TournamentCreateInteraction.name, [InteractionType.ModalSubmit]);
    }

    async execute(interaction) {
        if(!interaction.guild) return Locale.text(interaction, "GUILD_ONLY");
        const guildData = await DiscordGuildData.getByID(interaction.guild.id);
        if(!interaction.member.roles.cache.hasAny(guildData.tournamentOrganizerRole, ...Config.TOURNAMENT_ORGANIZER_ROLES)) return Locale.text(interaction, "TOURNAMENT_ORGANIZERS_ONLY");
        const topFormat = interaction.fields.getTextInputValue("topFormat") || "[{position}] [{player}]";
        const bottomFormat = interaction.fields.getTextInputValue("bottomFormat") || "- {area} ;; {time} ;; {attempt}";
        const attempts = parseInt(interaction.fields.getTextInputValue("attempts")) || 3;
        const duration = parseInt(interaction.fields.getTextInputValue("duration")) || 7;
        let type = interaction.fields.getTextInputValue("type") || "best"; // "best", "sum"
        if(!["best", "sum"].includes(type)) type = "best";

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("tournament-add")
                    .setLabel("Add run")
                    .setStyle(ButtonStyle.Secondary)
            )

        const tournament = new TournamentData({id: -1, topFormat, bottomFormat, type, attempts, duration: duration * 86400000});
        const message = await interaction.channel.send({content: tournamentFormatter(tournament), components: [row]}).catch();
        if(!message) return Locale.text(interaction, "TOURNAMENT_CANNOT_SEND_MESSAGE");
        tournament.id = message.id;
        await tournament.save();
        return {ephemeral: true, content: Locale.text(interaction, "TOURNAMENT_CREATED")}
    }
}

export default TournamentCreateInteraction;