import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import Config from "../classes/config.js";

class CreditsInteraction extends DefaultInteraction {
    static name = "credits";
    static applicationCommand = new SlashCommandBuilder()
        .setName(CreditsInteraction.name)
        .setDescription("We've reached the end, Van. Let's go home.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)

    constructor() {
        super(CreditsInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(Locale.text(interaction, "CREDITS_TITLE"))
            .setDescription(Locale.text(interaction, "CREDITS"))
            .setColor("#77BBAA")
            .setURL(Config.SERVER_INVITE)
            .setAuthor({ iconURL: interaction.client.user.avatarURL({ size: 128 }), name: "GitHub", url: Config.REPOSITORY_LINK })
            .setTimestamp()

        return { embeds: [embed] };
    }
}

export default CreditsInteraction;