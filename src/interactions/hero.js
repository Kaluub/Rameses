import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import EvadesData from "../classes/evadesData.js";

class HeroInteraction extends DefaultInteraction {
    static name = "hero";

    constructor() {
        super(HeroInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const search = interaction.options.getFocused();
        const heroes = EvadesData.heroes
            .filter(hero => hero.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 25)

        const response = [];
        for (const hero of heroes) {
            response.push({ name: hero, value: hero });
        }
        
        await interaction.respond(response);
    }
}

export default HeroInteraction;