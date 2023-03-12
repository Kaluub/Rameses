import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import { WikiPageData } from "../classes/data.js";

class WikiPageAutofillInteraction extends DefaultInteraction {
    static name = "wiki-page";

    constructor() {
        super(WikiPageAutofillInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const filter = WikiPageData.findMatchingPages(interaction.options.getFocused() ?? "");
        const pages = await filter.toArray();
        const response = [];
        for (const page of pages) {
            if (!page) continue
            if (page.private) continue;
            response.push({ name: page.title, value: page.uuid ?? page.title });
        }
        await interaction.respond(response);
    }
}

export default WikiPageAutofillInteraction;