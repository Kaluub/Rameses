import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, EmbedBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";


class SpeedrunInteraction extends DefaultInteraction {
    static name = "speedruns";
    static applicationCommand = new SlashCommandBuilder()
        .setName(SpeedrunInteraction.name)
        .setDescription(Locale.defaultText("HIGHSCORES_SPEEDRUN_DESC"))
        .setDescriptionLocalizations(Locale.getLocaleMap("HIGHSCORES_SPEEDRUN_DESC"))
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addStringOption(
            new SlashCommandStringOption()
                .setName("region-extended")
                .setDescription("The region or map to check")
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("player-count")
                .setDescription("Amount of players in the run")
                .setRequired(true)
        )

    constructor() {
        super(SpeedrunInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const region = this.getStringArgument(interaction, "region-extended", 0);
        const playerCount = this.getIntegerArgument(interaction, "player-count", 1);

        if (!region || playerCount === undefined)
            return this.formatContent(interaction, "COMMAND_ERROR");

        let isSolo, playerCountText
        if (playerCount === 1) {
            isSolo = true;
            playerCountText = "solo";
        }
        else if (playerCount === 2) {
            isSolo = false;
            playerCountText = "duo";
        }
        else
            return this.formatContent(interaction, "HIGHSCORES_INVALID_PLAYER_COUNT")

        const scores = await interaction.client.highScoresAPI.getRegionScores(region, isSolo);

        if (!scores)
            return this.formatContent(interaction, "HIGHSCORES_INVALID_REGION")

        const embed = new EmbedBuilder()
            .setColor("#33ddc1")
            .setTitle(Locale.text(interaction, "REGION_SPEEDRUNS", [region, playerCountText]))
            .addFields(scores.map(score => {
                const areaText = score.area ? `— Area ${score.area}` : "";
                const time = Utils.timeSecondsToTime(Utils.parseSheetTimeToSeconds(score.time))

                return {
                    name: `${score.place} — ${time} ${areaText}`,
                    value: `${Utils.sanitizeUsername(score.player)} • ${score.hero}`,
                    inline: false
                };
            }))
            .setTimestamp();

        return { embeds: [embed] }
    }
}

export default SpeedrunInteraction;