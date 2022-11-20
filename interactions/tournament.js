import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import Config from "../config.js";

class TournamentInteraction extends DefaultInteraction {
    static name = "tournament";
    static applicationCommand = new SlashCommandBuilder()
        .setName(TournamentInteraction.name)
        .setDescription("Tournament related commands.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("start")
                .setDescription("Start a new tournament.")
        )

    constructor() {
        super(TournamentInteraction.name, [InteractionType.ApplicationCommand]);
        this.disabled = true;
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand(false)
        if(subcommand == "start") {
            if(!interaction.member) return "Please use this in the Discord server.";
            if(!interaction.member.roles.cache.has(Config.TOURNAMENT_ORGANIZER_ROLE)) return "You need to be a Tournament Organizer to use this tool!"
        }
        return "How did we get here?";
    }
}

export default TournamentInteraction;