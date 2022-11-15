import DefaultInteraction from "../defaultInteraction.js";
import AccountData from "../accountData.js";
import { ActionRowBuilder, InteractionType, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

class LinkInteraction extends DefaultInteraction {
    static name = "link";
    static applicationCommand = new SlashCommandBuilder()
        .setName(LinkInteraction.name)
        .setDescription("Link to your Evades.io account")

    constructor() {
        super(LinkInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const account = await AccountData.getByDiscordId(interaction.user.id);
        if(account) return `Your Discord account is already linked to the in-game account "${account.displayName ?? account.username}"!`;
        const loginModal = new ModalBuilder()
            .setCustomId("login-modal")
            .setTitle("Evades Login")
            .addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("username")
                            .setLabel("Username:")
                            .setPlaceholder("Your evades username")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        new TextInputBuilder()
                            .setCustomId("password")
                            .setLabel("Password:")
                            .setPlaceholder("Your evades password")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
            )
        interaction.showModal(loginModal);
    }
}

export default LinkInteraction;