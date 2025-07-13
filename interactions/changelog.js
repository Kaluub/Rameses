import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import Locale from "../classes/locale.js";

class ChangelogInteraction extends DefaultInteraction {
    static name = "changelog";
    static applicationCommand = new SlashCommandBuilder()
        .setName(ChangelogInteraction.name)
        .setDescription(Locale.defaultText("INTERACTION_CHANGELOG_DESC"))
        .setDescriptionLocalizations(Locale.getLocaleMap("INTERACTION_CHANGELOG_DESC"))
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addStringOption(
            new SlashCommandStringOption()
                .setName("changelog")
                .setDescription("The title of the changelog to view.")
                .setRequired(false)
                .setAutocomplete(true)
        )

    constructor() {
        super(ChangelogInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent, InteractionType.ApplicationCommandAutocomplete]);
        this.defer = true;
        this.updateIfComponent = true;
    }

    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            const changelog = await interaction.client.evadesAPI.getChangelog();
            if (changelog === null) {
                return await interaction.respond([]);
            }

            const response = [];
            for (const entry of changelog.filter(entry => entry.header.includes(interaction.options.getFocused() ?? ""))) {
                if (response.length >= 25) {
                    break;
                }
                response.push({ name: entry.header, value: (changelog.indexOf(entry) + 1).toString() });
            }
            return await interaction.respond(response);
        } else {
            const changelog = await interaction.client.evadesAPI.getChangelog();
            if (changelog === null) {
                return Locale.text(interaction, "CHANGELOG_UNAVAILABLE");
            }

            const changelogNumber = parseInt(interaction?.options?.getString("changelog")) - 1 || parseInt(interaction?.customId?.split("/")[1]) || 0;
            if (!changelog[changelogNumber]) {
                return Locale.text(interaction, "CHANGELOG_UNAVAILABLE");
            }

            let string = `**__${changelog[changelogNumber].header}__**:`;
            for (const segment of changelog[changelogNumber].changes) {
                const toAdd = `\n• ${segment.content}\n`;
                if ((string + toAdd).length > 1995) {
                    // Prevent long changelogs from getting over the limit.
                    string += `\n...`;
                    break;
                }
                string += toAdd;
            }

            const actionRow = new ActionRowBuilder().setComponents(
                new ButtonBuilder()
                    .setCustomId(`changelog/${changelogNumber - 1}/newer`)
                    .setLabel(Locale.text(interaction, "NEWER"))
                    .setDisabled(changelogNumber - 1 < 0)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`changelog/${changelogNumber + 1}/older`)
                    .setLabel(Locale.text(interaction, "OLDER"))
                    .setDisabled(changelogNumber + 1 >= changelog.length)
                    .setStyle(ButtonStyle.Primary)
            )

            const embed = new EmbedBuilder()
                .setTitle("In-game changelog:")
                .setColor("#887711")
                .setDescription(string)
                .setURL("https://evades.io/")
                .setFooter({ text: `Update ${changelogNumber + 1} of ${changelog.length}` })
                .setTimestamp()

            if (interaction.isMessageComponent()) return await interaction.editReply({ embeds: [embed], components: [actionRow] });
            else return { embeds: [embed], components: [actionRow] };
        }
    }
}

export default ChangelogInteraction;