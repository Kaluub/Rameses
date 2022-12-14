import DefaultInteraction from "../defaultInteraction.js";
import { ApplicationCommandType, Collection, ContextMenuCommandBuilder, InteractionType } from "discord.js";
import { TournamentData } from "../data.js";

class TournamentStatsInteraction extends DefaultInteraction {
    static name = "Tournament Stats";
    static applicationCommand = new ContextMenuCommandBuilder()
        .setName(TournamentStatsInteraction.name)
        .setType(ApplicationCommandType.Message)

    constructor() {
        super(TournamentStatsInteraction.name, [InteractionType.ApplicationCommand]);
        this.defer = true;
        this.ephemeral = true;
    }

    async execute(interaction) {
        const tournament = await TournamentData.getByID(interaction.targetMessage.id);
        if(!tournament) return {ephemeral: true, content: "This isn't a tournament message!"};
        let spectators = new Collection();
        for(const run of tournament.leaderboard) {
            let value = spectators.get(run.spectator) ?? 0;
            spectators.set(run.spectator, value + 1);
        }
        spectators.sort((spec1, spec2) => spec2 - spec1);
        let string =
`Tournament stats:
Created: <t:${Math.floor(tournament.created / 1000)}>
Runs: ${tournament.leaderboard.length} runs
Top spectators:`;
        for(const spectator of spectators.firstKey(5)) {
            const runs = spectators.get(spectator)
            string += `\n${(await interaction.client.users.fetch(spectator)).tag} spectated ${runs} runs`
        }

        return {ephemeral: true, content: string};
    }
}

export default TournamentStatsInteraction;