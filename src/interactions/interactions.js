import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";

const interactionDefaults = [
    {name: "Solo", value: 0},
    {name: "Duo", value: 0}
]

class InteractionsInteraction extends DefaultInteraction {
    static name = "interactions";

    constructor() {
        super(InteractionsInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {        
        await interaction.respond(interactionDefaults);
    }
}

export default InteractionsInteraction;