import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import EvadesData from "../classes/evadesData.js";

class RegionExtendedInteraction extends DefaultInteraction {
    static name = "region-extended";

    constructor() {
        super(RegionExtendedInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const search = interaction.options.getFocused();
        const regions = EvadesData.regions
            .filter(map => map.name.toLowerCase().includes(search.toLowerCase()) && map.isInGame)

        const response = [];
        for (const region of regions) {
            if (region.routes.length > 0 && region.name !== "Coupled Corridors")
                for (const route of region.routes)
                    response.push({ name: route.name, value: route.name });
            else
                response.push({ name: region.name, value: region.name });
        }

        await interaction.respond(response.slice(0, 25));
    }
}

export default RegionExtendedInteraction;