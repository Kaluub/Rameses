import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";
import { AccountData } from "../classes/data.js";

class UsernameInteraction extends DefaultInteraction {
    static name = "username";

    constructor() {
        super(UsernameInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const filter = AccountData.findMatchingUsernames(interaction.options.getFocused() ?? "").sort({ "careerVP": -1 });
        const accounts = await filter.toArray();
        
        const response = [];
        for (const account of accounts) {
            if (account.username?.length < 2 || account.username?.length > 100) continue;
            response.push({ name: account?.displayName ?? account.username, value: account?.displayName ?? account.username });
        }

        await interaction.respond(response);
    }
}

export default UsernameInteraction;