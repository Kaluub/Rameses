import DefaultInteraction from "../classes/defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import { sanitizeUsername } from "../utils.js";

class HallOfFameInteraction extends DefaultInteraction {
    static name = "hall-of-fame";
    static applicationCommand = new SlashCommandBuilder()
        .setName(HallOfFameInteraction.name)
        .setDescription("Check the hall of fame")

    constructor() {
        super(HallOfFameInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const hallOfFameEntries = await interaction.client.evadesAPI.getHallOfFame();
        if(!hallOfFameEntries) return Locale.text(interaction, "EVADES_ERROR");
        let hallOfFamePlayersString = Locale.text(interaction, "LEADERBOARD");
        let ranking = 0;
        let totalVP = 0;
        for(const hallOfFameEntry of hallOfFameEntries) {
            ranking += 1;
            if(ranking < 31) hallOfFamePlayersString += `\n${ranking <= 3 ? "🥇" : ranking <= 10 ? "🥈" : ranking <= 30 ? "🥉" : ""} ${ranking}. ${sanitizeUsername(hallOfFameEntry[0])} (${hallOfFameEntry[1]} ${Locale.text(interaction, "VICTORY_POINTS")})`;
            totalVP += parseInt(hallOfFameEntry[1]);
        };
        
        if(hallOfFamePlayersString.length > 1900) hallOfFamePlayersString = hallOfFamePlayersString.substring(0, 1900) + "...";
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "HALL_OF_FAME"))
            .setColor("#FFD700")
            .setTimestamp()
            .setDescription(hallOfFameEntries.length ? hallOfFamePlayersString : Locale.text(interaction, "LEADERBOARD_EMPTY"))
            .setFooter({text: Locale.text(interaction, "LEADERBOARD_FOOTER", [ranking, totalVP])})
        return { embeds: [embed] }
    }
}

export default HallOfFameInteraction;