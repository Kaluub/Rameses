import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder } from "discord.js";
import EvadesData from "../classes/evadesData.js";
import Locale from "../classes/locale.js";


class QuestInteraction extends DefaultInteraction {
    static name = "quest";
    static applicationCommand = new SlashCommandBuilder()
        .setName(QuestInteraction.name)
        .setDescription("View the current quest.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)

    constructor() {
        super(QuestInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const quest = await interaction.client.evadesAPI.getCurrentQuest();
        if (!quest) {
            return Locale.text(interaction, "EVADES_ERROR");
        }

        return this.render(interaction, quest);
    }

    async tests(interaction) {
        const embeds = [];
        for (const region in EvadesData.regions) {
            const quest = {region_name: region, completions: 0, completions_required: 0, week_number: 0};
            embeds.push(this.render(interaction, quest).embeds[0]);
        }
        for (let i = 0; i < embeds.length; i += 10) {
            await interaction.followUp({embeds: embeds.slice(i, i+9)});
        }
    }

    render(interaction, quest) {
        const percentage = Math.min(100, quest.completions / (quest.completions_required || 1) * 100).toFixed(2);
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "QUEST_TITLE"))
            .setColor(EvadesData.regions[quest.region_name]?.color ?? "#AAFFAA")
            .setDescription(Locale.text(interaction, "QUEST_DESCRIPTION", [quest.region_name, quest.completions, quest.completions_required, percentage]))
            .setFooter({text: Locale.text(interaction, "QUEST_FOOTER", [quest.week_number])})
            .setTimestamp();
        
        return { embeds: [embed] };
    }
}

export default QuestInteraction;