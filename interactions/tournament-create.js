import DefaultInteraction from "../defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } from "discord.js";
import { tournamentFormatter } from "../utils.js";
import Config from "../config.js";
import { TournamentData } from "../data.js";

class TournamentCreateInteraction extends DefaultInteraction {
    static name = "tournament-create";

    constructor() {
        super(TournamentCreateInteraction.name, [InteractionType.ModalSubmit]);
    }

    async execute(interaction) {
        if(!interaction.member) return "Please use this in the Discord server.";
        if(!interaction.member.roles.cache.has(Config.TOURNAMENT_ORGANIZER_ROLE)) return "You need to be a Tournament Organizer to use this tool!";
        const format = interaction.fields.getTextInputValue("format") || "[{position}] [{player}]\n{area} ;; {time} ;; {attempt}";
        const attempts = parseInt(interaction.fields.getTextInputValue("attempts")) || 3;
        const teamSize = parseInt(interaction.fields.getTextInputValue("team-size")) || 1;
        const duration = parseInt(interaction.fields.getTextInputValue("duration")) || 7;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("tournament-add")
                    .setLabel("Add run")
                    .setStyle(ButtonStyle.Secondary)
            )

        const message = await interaction.channel.send({content: tournamentFormatter({format, attempts, teamSize}), components: [row]})
        const tournament = new TournamentData({id: message.id, format, attempts, teamSize, duration: duration * 86400000});
        await tournament.save();
        return {ephemeral: true, content: "Tournament created!"}
    }
}

export default TournamentCreateInteraction;