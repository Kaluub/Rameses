import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType } from "discord.js";
import { AccountData } from "../data.js";

class UsernameAutofillInteraction extends DefaultInteraction {
    static name = "username";

    constructor() {
        super(UsernameAutofillInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
        this.defer = false;
    }

    async execute(interaction) {
        const filter = AccountData.findMatchingUsernames(interaction.options.getFocused() ?? "");
        const accounts = await filter.toArray();
        const response = [];
        for(const account of accounts) {
            response.push({name: account?.displayName ?? account.username, value: account?.displayName ?? account.username});
        }
        await interaction.respond(response);
    }
}

export default UsernameAutofillInteraction;