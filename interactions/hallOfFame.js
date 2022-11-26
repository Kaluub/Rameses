import DefaultInteraction from "../defaultInteraction.js";
import { EmbedBuilder, escapeMarkdown, InteractionType, SlashCommandBuilder } from "discord.js";

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
        if(!hallOfFameEntries) return "Couldn't connect to Evades!";
        let hallOfFamePlayersString = "Leaderboard:";
        let ranking = 0;
        let totalVP = 0;
        for(const hallOfFameEntry of hallOfFameEntries) {
            ranking += 1;
            if(ranking < 11) hallOfFamePlayersString += `\n${ranking}. ${escapeMarkdown(hallOfFameEntry[0])} (${hallOfFameEntry[1]} VP)`;
            totalVP += parseInt(hallOfFameEntry[1]);
        };
        
        if(hallOfFamePlayersString.length > 1900) hallOfFamePlayersString = hallOfFamePlayersString.substring(0, 1900) + "...";
        const embed = new EmbedBuilder()
            .setTitle("Hall of Fame:")
            .setColor("#FFD700")
            .setTimestamp()
            .setDescription(hallOfFameEntries.length ? hallOfFamePlayersString : "The leaderboard is empty!")
            .setFooter({text: `${ranking} players have collected ${totalVP} VP this week`})
        return { embeds: [embed] }
    }
}

export default HallOfFameInteraction;