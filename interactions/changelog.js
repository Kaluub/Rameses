import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import GameChangelog from "../classes/gameChangelog.js";
import Locale from "../classes/locale.js";

class ChangelogInteraction extends DefaultInteraction {
    static name = "changelog";
    static applicationCommand = new SlashCommandBuilder()
        .setName(ChangelogInteraction.name)
        .setDescription("Check the in-game changelog from Discord.")
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
            if (!GameChangelog.cache) return await interaction.respond([]);
            const response = [];
            for (const page of GameChangelog.cache.filter(cl => cl.title.includes(interaction.options.getFocused() ?? ""))) {
                if (response.length >= 25) break;
                response.push({ name: page.title, value: (GameChangelog.cache.indexOf(page) + 1).toString() });
            }
            return await interaction.respond(response);
        } else {
            // Make sure changelog exists
            if (!GameChangelog.cache) await GameChangelog.updateChangelog();
            if (!GameChangelog.cache) return Locale.text(interaction, "CHANGELOG_UNAVAILABLE");

            const changelogNumber = parseInt(interaction?.options?.getString("changelog")) - 1 || parseInt(interaction?.customId?.split("/")[1]) || 0;
            if (!GameChangelog.cache[changelogNumber]) return Locale.text(interaction, "CHANGELOG_UNAVAILABLE");

            let string = `**__${GameChangelog.cache[changelogNumber]?.title}__**:`;
            for (const segment of GameChangelog.cache[changelogNumber]?.content ?? []) {
                const toAdd = `\n• ${segment}\n`;
                if ((string + toAdd).length > 2000) break;
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
                    .setDisabled(changelogNumber + 1 >= GameChangelog.cache.length)
                    .setStyle(ButtonStyle.Primary)
            )

            const embed = new EmbedBuilder()
                .setTitle("In-game changelog:")
                .setColor("#887711")
                .setDescription(string)
                .setURL("https://evades.io/")
                .setFooter({ text: `Update ${changelogNumber + 1} of ${GameChangelog.cache.length}` })
                .setTimestamp()

            if (interaction.isMessageComponent()) return await interaction.editReply({ embeds: [embed], components: [actionRow] });
            else return { embeds: [embed], components: [actionRow] };
        }
    }
}

export default ChangelogInteraction;