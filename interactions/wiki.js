import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { WikiPageData } from "../classes/data.js";
import ButtonLinks from "../classes/buttonLinks.js";

class WikiInteraction extends DefaultInteraction {
    static name = "wiki";
    static applicationCommand = new SlashCommandBuilder()
        .setName(WikiInteraction.name)
        .setDescription("View an in-depth encyclopedia regarding Evades!")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("page")
                .setDescription("View a page of information")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("wiki-page")
                        .setDescription("The page to view")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )

    constructor() {
        super(WikiInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        const subcommand = this.getSubcommand(interaction);

        if (subcommand == "page") {
            const pageIdentifier = interaction?.options?.getString("wiki-page", false) ?? interaction?.customId?.split("/")[2];
            if (!pageIdentifier) return "Please provide a page title!";
            
            const page = await WikiPageData.getByUUID(pageIdentifier) ?? await WikiPageData.getByTitle(pageIdentifier);
            if (!page) return "The page was not found!";
            
            const embed = new EmbedBuilder()
                .setColor("#D665D2")
                .setTitle(page.title ?? "No title!")
                .setTimestamp(page.edited ?? Date.now())
                .setFooter({ text: "Last edited" })
                .setDescription(page.content ?? "This page is empty!")
            
            if (page.imageURL)
                embed.setImage(page.imageURL);
            
            let result = { embeds: [embed] };

            if (page.links.length) {
                const links = new ButtonLinks(null, page.links);
                result.components = links.parseFromArray();
            }

            return result;
        }

        return "How did we get here?";
    }
}

export default WikiInteraction;
