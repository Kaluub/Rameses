import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";

class HallOfFameInteraction extends DefaultInteraction {
    static name = "hall-of-fame";
    static applicationCommand = new SlashCommandBuilder()
        .setName(HallOfFameInteraction.name)
        .setDescription("Check the hall of fame")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)

    constructor() {
        super(HallOfFameInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const hallOfFameEntries = await interaction.client.evadesAPI.getHallOfFame();
        if (!hallOfFameEntries) return Locale.text(interaction, "EVADES_ERROR");
        let hallOfFamePlayersString = Locale.text(interaction, "LEADERBOARD");
        let ranking = 0;
        for (const hallOfFameEntry of hallOfFameEntries) {
            ranking += 1;
            if (ranking < 31) {
                hallOfFamePlayersString += `\n${ranking <= 3 ? "🥇" : ranking <= 10 ? "🥈" : ranking <= 30 ? "🥉" : ""} ${ranking}. ${Utils.sanitizeUsername(hallOfFameEntry[0])} (${hallOfFameEntry[1]} ${Locale.text(interaction, "VICTORY_POINTS")})`;
            } else {
                break;
            }
        };

        
        if (hallOfFamePlayersString.length > 1900) {
            hallOfFamePlayersString = hallOfFamePlayersString.substring(0, 1900) + "...";
        }
        
        const totalVP = hallOfFameEntries.reduce((prev, cur) => prev + parseInt(cur[1]), 0);
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "HALL_OF_FAME"))
            .setColor("#FFD700")
            .setTimestamp()
            .setDescription(hallOfFameEntries.length ? hallOfFamePlayersString : Locale.text(interaction, "LEADERBOARD_EMPTY"))
            .setFooter({ text: Locale.text(interaction, "HALL_OF_FAME_FOOTER", [hallOfFameEntries.length, totalVP]) })
        
        return { embeds: [embed] }
    }
}

export default HallOfFameInteraction;