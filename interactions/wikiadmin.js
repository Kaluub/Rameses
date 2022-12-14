import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType, ModalBuilder, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { WikiPageData } from "../classes/data.js";
import Config from "../config.js";

const wikiadmins = [
    "461564949768962048", // Kaluub
    "474088900953112576", // Piger
    "291543872666861568", // Dep
    "325966339904897026", // Jackal
    "512215933155016724", // Invi
];

class WikiAdminInteraction extends DefaultInteraction {
    static name = "wikiadmin";
    static noGlobalInteraction = true;
    static guilds = [Config.DEVELOPMENT_SERVER];
    static applicationCommand = new SlashCommandBuilder()
        .setName(WikiAdminInteraction.name)
        .setDescription("Wiki admin commands")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("create")
                .setDescription("Create a new page")
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("edit")
                .setDescription("Edit a page")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("wiki-page")
                        .setDescription("The page to edit")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("remove")
                .setDescription("Private a page")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("wiki-page")
                        .setDescription("The page to private")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )

    constructor() {
        super(WikiAdminInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        if(interaction.isChatInputCommand()) {
            const subcommand = interaction.options.getSubcommand(false);
            if(subcommand == "create") {
                if(!wikiadmins.includes(interaction.user.id)) return {content: "You are not authorized to do this!", ephemeral: true};
                const modal = new ModalBuilder()
                    .setCustomId("wikiadmin/create")
                    .setTitle("Create a new page:")
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                .setCustomId("title")
                                .setLabel("Title of page:")
                                .setMaxLength(50)
                                .setPlaceholder("The title of the page. Keep it short!")
                                .setStyle(TextInputStyle.Short)
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                .setCustomId("content")
                                .setLabel("Page content:")
                                .setMaxLength(1900)
                                .setPlaceholder("Put the details here. Due to Discord limitations, maximum of 1900 characters.")
                                .setStyle(TextInputStyle.Paragraph)
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                .setCustomId("image")
                                .setLabel("Image URL:")
                                .setMaxLength(1900)
                                .setPlaceholder("Feel free to add an image URL here if needed.")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                            )
                    )
                await interaction.showModal(modal);
            }
            if(subcommand == "edit") {
                if(!wikiadmins.includes(interaction.user.id)) return {content: "You are not authorized to do this!", ephemeral: true};
                const pageIdentifier = interaction.options.getString("wiki-page", false);
                if(!pageIdentifier) return {content: "Please provide a page title!", ephemeral: true};
                const page = await WikiPageData.getByUUID(pageIdentifier) ?? await WikiPageData.getByTitle(pageIdentifier);
                if(!page) return {content: "The page was not found!", ephemeral: true};
                const modal = new ModalBuilder()
                    .setCustomId("wikiadmin/edit/" + page.uuid)
                    .setTitle("Edit an existing page:")
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                .setCustomId("title")
                                .setLabel("Title of page:")
                                .setMaxLength(50)
                                .setPlaceholder("The title of the page. Keep it short!")
                                .setStyle(TextInputStyle.Short)
                                .setValue(page.title ?? "")
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                .setCustomId("content")
                                .setLabel("Page content:")
                                .setMaxLength(1900)
                                .setPlaceholder("Put the details here. Due to Discord limitations, maximum of 1900 characters.")
                                .setStyle(TextInputStyle.Paragraph)
                                .setValue(page.content ?? "")
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                .setCustomId("image")
                                .setLabel("Image URL:")
                                .setMaxLength(1900)
                                .setPlaceholder("Feel free to add an image URL here if needed.")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(page.imageURL ?? "")
                            )
                    )
                await interaction.showModal(modal);
            }
            if(subcommand == "remove") {
                if(!wikiadmins.includes(interaction.user.id)) return {content: "You are not authorized to do this!", ephemeral: true};
                const pageIdentifier = interaction.options.getString("wiki-page", false);
                if(!pageIdentifier) return {content: "Please provide a page title!", ephemeral: true};
                let page = await WikiPageData.getByUUID(pageIdentifier) ?? await WikiPageData.getByTitle(pageIdentifier);
                if(!page) return {content: "The page was not found!", ephemeral: true};
                page.private = true;
                await page.save();
                return {content: "The page was privated.", ephemeral: true};
            }
            return "How did we get here?";
        } else if(interaction.isModalSubmit()) {
            const subcommand = interaction.customId.split("/")[1];
            if(subcommand == "create") {
                if(!wikiadmins.includes(interaction.user.id)) return {content: "You are not authorized to do this!", ephemeral: true};
                const title = interaction.fields.getTextInputValue("title");
                const content = interaction.fields.getTextInputValue("content");
                const imageURL = interaction.fields.getTextInputValue("image") ?? null;
                if(await WikiPageData.getByTitle(title)) return {content: "There is already a page with this title! Save your content!\n\n" + content, ephemeral: true};
                const wikiPage = new WikiPageData({title, content, imageURL, authors: [interaction.user.id]});
                await wikiPage.save();
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("wiki/page/" + wikiPage.uuid)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("View page")
                    )
                return {content: "Page created successfully!", ephemeral: true, components: [actionRow]};
            }
            if(subcommand == "edit") {
                if(!wikiadmins.includes(interaction.user.id)) return {content: "You are not authorized to do this!", ephemeral: true};
                const uuid = interaction.customId.split("/")[2];
                const title = interaction.fields.getTextInputValue("title");
                const content = interaction.fields.getTextInputValue("content");
                const imageURL = interaction.fields.getTextInputValue("image") ?? null;
                let wikiPage = await WikiPageData.getByUUID(uuid);
                wikiPage.title = title;
                wikiPage.content = content;
                if(imageURL) wikiPage.imageURL = imageURL;
                if(!wikiPage.authors.includes(interaction.user.id)) wikiPage.authors.push(interaction.user.id);
                await wikiPage.save();
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("wiki/page/" + wikiPage.uuid)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("View page")
                    )
                return {content: "Page updated successfully!", ephemeral: true, components: [actionRow]};
            }
        }
    }
}

export default WikiAdminInteraction;
