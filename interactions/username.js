import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType } from "discord.js";
import { AccountData } from "../data.js";

class UsernameInteraction extends DefaultInteraction {
    static name = "username";

    constructor() {
        super(UsernameInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const filter = AccountData.findMatchingUsernames(interaction.options.getFocused() ?? "");
        const accounts = await filter.toArray();
        const response = [];
        for(const account of accounts) {
            if(!account.username?.length) continue;
            response.push({name: account?.displayName ?? account.username, value: account?.displayName ?? account.username});
        }
        await interaction.respond(response);
    }
}

export default UsernameInteraction;