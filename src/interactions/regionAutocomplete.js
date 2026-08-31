import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import EvadesData from "../classes/evadesData.js";

class RegionInteraction extends DefaultInteraction {
    static name = "region";

    constructor() {
        super(RegionInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const search = interaction.options.getFocused();
        const regions = EvadesData.regions
            .filter(map => map.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 25)

        const response = [];
        for (const region of regions) {
            if (!region.isInGame) continue;
            response.push({ name: region.name, value: region.name });
        }
        
        await interaction.respond(response);
    }
}

export default RegionInteraction;