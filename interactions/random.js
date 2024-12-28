import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder, SlashCommandIntegerOption } from "discord.js";
import Locale from "../classes/locale.js";
import EvadesData from "../classes/evadesData.js";
import Utils from "../classes/utils.js";

class RandomInteraction extends DefaultInteraction {
    static name = "random";
    static applicationCommand = new SlashCommandBuilder()
        .setName(RandomInteraction.name)
        .setDescription("Pulls a random region & some heroes for you.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("heroes")
                .setDescription("The amount of heroes you want to use in your team.")
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)
        )

    constructor() {
        super(RandomInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const amountOfHeroes = this.getIntegerArgument(interaction, "heroes", 1) || 1;

        const heroes = Utils.randomElements(EvadesData.heroes, amountOfHeroes);
        const region = Utils.randomElements(EvadesData.regionsExtended, 1)[0];

        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "RANDOM_TITLE"))
            .setDescription(Locale.text(interaction, "RANDOM_RESULTS", [region, heroes.join("\n")]))
            .setColor("#BF77A0")
            .setTimestamp()
        
        const rerollButton = new ButtonBuilder()
            .setCustomId("random/" + amountOfHeroes)
            .setStyle(ButtonStyle.Primary)
            .setLabel(Locale.text(interaction, "REROLL"))
        
        const row = new ActionRowBuilder()
            .setComponents(rerollButton)

        if (interaction.isMessageComponent()) return await interaction.update({ embeds: [embed], components: [row] });
        return { embeds: [embed], components: [row] }
    }
}

export default RandomInteraction;