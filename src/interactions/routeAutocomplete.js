import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import EvadesData from "../classes/evadesData.js";

class RouteInteraction extends DefaultInteraction {
    static name = "route";

    constructor() {
        super(RouteInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const search = interaction.options.getFocused().toLowerCase();
        const regionName = interaction.options.getString("region");

        const region = EvadesData.regions.find(
            map => map.isInGame && map.name === regionName
        );

        if (!region)
            return interaction.respond([]); // region not picked/valid yet

        const response = region.routes
            .filter(route => route.name.toLowerCase().includes(search))
            .slice(0, 25)
            .map(route => ({ name: route.name, value: route.name }));

        await interaction.respond(response);
    }
}

export default RouteInteraction;