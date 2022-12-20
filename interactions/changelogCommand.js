import DefaultInteraction from "../classes/defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder } from "discord.js";
import Changelog from "../classes/changelog.js";
import Locale from "../classes/locale.js";

class ChangelogInteraction extends DefaultInteraction {
    static name = "changelog";
    static applicationCommand = new SlashCommandBuilder()
        .setName(ChangelogInteraction.name)
        .setDescription("Check the in-game changelog from Discord.")

    constructor() {
        super(ChangelogInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        if(!Changelog.cache) await Changelog.updateChangelog();
        if(!Changelog.cache) return Locale.text(interaction, "CHANGELOG_UNAVAILABLE");
        let string = `**__${Changelog.cache.title}__**:`;
        for(const segment of Changelog.cache.content) {
            const toAdd = `\n• ${segment}\n`;
            if((string + toAdd).length > 2000) break;
            string += toAdd;
        }

        const embed = new EmbedBuilder()
            .setTitle("In-game changelog:")
            .setColor("#887711")
            .setDescription(string)
            .setURL("https://evades.io/")
            .setTimestamp()
        
        return {embeds: [embed]};
    }
}

export default ChangelogInteraction;