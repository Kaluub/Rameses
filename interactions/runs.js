import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import Locale from "../classes/locale.js";
import { sanitizeUsername } from "../utils.js";

class RunsInteraction extends DefaultInteraction {
    static name = "runs";
    static applicationCommand = new SlashCommandBuilder()
        .setName(RunsInteraction.name)
        .setDescription("View run history from within Discord")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("username")
                .setDescription("The username to filter for")
                .setAutocomplete(true)
                .setRequired(false)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("region")
                .setDescription("The region to filter for")
                .setAutocomplete(true)
                .setRequired(false)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("page")
                .setDescription("The page number to filter for")
                .setMinValue(1)
                .setRequired(false)
        )

    constructor() {
        super(RunsInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
        this.updateIfComponent = true;
        this.runsPerPage = 10;
    }

    async execute(interaction) {
        let username = this.getStringArgument(interaction, "username", 1);
        let region = this.getStringArgument(interaction, "region", 2);
        let offset = this.getIntegerArgument(interaction, "page", 3);

        if (username === "X")
            username = undefined;
        if (region === "X")
            region = undefined;
        if (isNaN(offset))
            offset = 1;

        let runs = await interaction.client.evadesAPI.getRuns({ username, region, offset: (offset - 1) * this.runsPerPage })
        if (!runs)
            return Locale.text(interaction, "EVADES_ERROR");
        
        runs = runs.slice(0, this.runsPerPage);
        
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "RUNS_TITLE"))
            .setColor("#BBEEDD")
            .setTimestamp()
        
        for (const run of runs) {
            embed.addFields({
                name: `${sanitizeUsername(run.username)} as ${run.hero}`,
                value: `completed **${run.region_name} ${run.area_index}** in ${Math.floor(run.survival_time / 60)}m ${run.survival_time % 60}s (<t:${run.created_at}:R>)`
            })
        }

        if (!embed.data.fields?.length)
            embed.setDescription(Locale.text(interaction, "NO_RUNS_FOUND"))

        const newerButton = new ButtonBuilder()
            .setCustomId(`runs/${username ?? "X"}/${region ?? "X"}/${offset - 1}`)
            .setDisabled((offset - 1) < 1 || runs.length === 0)
            .setStyle(ButtonStyle.Primary)
            .setLabel(Locale.text(interaction, "NEWER"))
        
        const olderButton = new ButtonBuilder()
            .setCustomId(`runs/${username ?? "X"}/${region ?? "X"}/${offset + 1}`)
            .setDisabled(runs.length !== this.runsPerPage)
            .setStyle(ButtonStyle.Primary)
            .setLabel(Locale.text(interaction, "OLDER"))
             
        const row = new ActionRowBuilder()
            .addComponents(newerButton, olderButton)

        if (interaction.isMessageComponent()) return await interaction.editReply({ embeds: [embed], components: [row] });
        else return { embeds: [embed], components: [row] }
    }
}

export default RunsInteraction;