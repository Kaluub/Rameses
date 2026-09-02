import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandIntegerOption, EmbedBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";
import Config from "../classes/config.js";


class SpeedrunInteraction extends DefaultInteraction {
    static name = "speedruns";
    static disabled = Config.GOOGLE_API_KEY === null;
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
                .setChoices([
                    {name: "Solo", value: 1},
                    {name: "Duo", value: 2},
                ])
        )

    constructor() {
        super(SpeedrunInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const region = this.getStringArgument(interaction, "region-extended", 0);
        const playerCount = this.getIntegerArgument(interaction, "player-count", 1);

        if (!region || playerCount === undefined) {
            return this.formatContent(interaction, "COMMAND_ERROR");
        }

        let isSolo, playerCountText, link;
        if (playerCount === 1) {
            isSolo = true;
            playerCountText = "solo";
            link = "https://docs.google.com/spreadsheets/d/1iNQsgPGu0xtSNyKEBDt8jr9EQfjD4Djn4e-qL7ljrRc/edit?gid=951285843#gid=951285843";
        } else if (playerCount === 2) {
            isSolo = false;
            playerCountText = "duo";
            link = "https://docs.google.com/spreadsheets/d/1iNQsgPGu0xtSNyKEBDt8jr9EQfjD4Djn4e-qL7ljrRc/edit?gid=759130778#gid=759130778";
        } else {
            return this.formatContent(interaction, "HIGHSCORES_INVALID_PLAYER_COUNT");
        }

        const scores = await interaction.client.highScoresAPI.getRegionScores(region, isSolo);

        if (!scores) {
            return this.formatContent(interaction, "HIGHSCORES_INVALID_REGION");
        }

        const embed = new EmbedBuilder()
            .setColor("#33ddc1")
            .setTitle(Locale.text(interaction, "REGION_SPEEDRUNS", [region, playerCountText]))
            .addFields(scores.map(score => {
                const areaText = score.area ? `— Area ${score.area}` : "";
                const time = Utils.timeSecondsToTime(Utils.parseSheetTimeToSeconds(score.time));

                return {
                    name: `${score.place} — ${time} ${areaText}`,
                    value: `${Utils.sanitizeUsername(score.player)} • ${score.hero}`,
                    inline: false
                };
            }))
            .setURL(link)
            .setTimestamp();

        return { embeds: [embed] };
    }
}

export default SpeedrunInteraction;