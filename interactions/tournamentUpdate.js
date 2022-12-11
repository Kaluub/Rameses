import DefaultInteraction from "../defaultInteraction.js";
import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionType } from "discord.js";
import { TournamentData } from "../data.js";
import { tournamentFormatter } from "../utils.js";

class TournamentStatsInteraction extends DefaultInteraction {
    static name = "Update Tournament";
    static applicationCommand = new ContextMenuCommandBuilder()
        .setName(TournamentStatsInteraction.name)
        .setType(ApplicationCommandType.Message)

    constructor() {
        super(TournamentStatsInteraction.name, [InteractionType.ApplicationCommand]);
        this.defer = true;
        this.ephemeral = true;
    }

    async execute(interaction) {
        if(!interaction.member) return "Please use this in the Discord server.";
        if(!interaction.member.roles.cache.hasAny(...Config.TOURNAMENT_ORGANIZER_ROLES)) return "You need to be a Tournament Organizer to use this tool!";
        const tournament = await TournamentData.getByID(interaction.targetMessage.id);
        if(!tournament) return {ephemeral: true, content: "This isn't a tournament message!"};
        await interaction.update({content: tournamentFormatter(tournament)});
        await interaction.followUp({content: "Updated the leaderboard to reflect potential internal changes/updates (if you aren't Kaluub, likely nothing changed).", ephemeral: true});
    }
}

export default TournamentStatsInteraction;