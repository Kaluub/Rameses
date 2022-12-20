import DefaultInteraction from "../classes/defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import Config from "../config.js";

class CreditsInteraction extends DefaultInteraction {
    static name = "credits";
    static applicationCommand = new SlashCommandBuilder()
        .setName(CreditsInteraction.name)
        .setDescription("We've reached the end, Van. Let's go home.")

    constructor() {
        super(CreditsInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "CREDITS_TITLE"))
            .setDescription(Locale.text(interaction, "CREDITS"))
            .setColor("#77BBAA")
            .setURL(Config.REPOSITORY_LINK)
            .setAuthor({iconURL: interaction.client.user.avatarURL({size: 128}), name: "Discord server", url: Config.SERVER_INVITE})
            .setTimestamp()
        
        return {embeds: [embed]};
    }
}

export default CreditsInteraction;