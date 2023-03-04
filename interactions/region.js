import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import EvadesData from "../evadesData.js";

class RegionInteraction extends DefaultInteraction {
    static name = "region";

    constructor() {
        super(RegionInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const search = interaction.options.getFocused();
        const regions = EvadesData.regions.filter(map => map.toLowerCase().includes(search.toLowerCase())).slice(0, 25);
        const response = [];
        for (const region of regions) {
            response.push({ name: region, value: region });
        }
        await interaction.respond(response);
    }
}

export default RegionInteraction;