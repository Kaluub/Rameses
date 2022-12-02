import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType } from "discord.js";
import { WikiPageData } from "../data.js";

class WikiPageAutofillInteraction extends DefaultInteraction {
    static name = "wiki-page";

    constructor() {
        super(WikiPageAutofillInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const filter = WikiPageData.findMatchingPages(interaction.options.getFocused() ?? "");
        const pages = await filter.toArray();
        const response = [];
        for(const page of pages) {
            response.push({name: page.title, value: page.uuid ?? page.title});
        }
        await interaction.respond(response);
    }
}

export default WikiPageAutofillInteraction;