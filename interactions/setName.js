import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { AccountData, DiscordUserData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";

class SetNameInteraction extends DefaultInteraction {
    static name = "set-name";
    static applicationCommand = new SlashCommandBuilder()
        .setName(SetNameInteraction.name)
        .setDescription("Set your in-game name here.")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("username")
                .setDescription("Your in-game name.")
                .setAutocomplete(true)
                .setRequired(true)
        )

    constructor() {
        super(SetNameInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        let userData = await DiscordUserData.getByID(interaction.user.id);
        if (userData.username)
            return Locale.text(interaction, "NAME_ALREADY_SET", [Utils.sanitizeUsername(userData.username)]);
        
        let username = interaction.options.getString("username");

        const checkedData = await DiscordUserData.getByUsername(username);
        if (checkedData)
            return Locale.text(interaction, "NAME_TAKEN", checkedData.id);
        
        const playerDetails = await interaction.client.evadesAPI.getPlayerDetails(username);
        if (!playerDetails)
            return Locale.text(interaction, "PLAYER_NOT_FOUND");
        
        const account = await AccountData.getByUsername(username, false);
        if (account.displayName)
            username = account.displayName;
        
        userData.username = username;
        await userData.save();
        return Locale.text(interaction, "NAME_SET", [Utils.sanitizeUsername(username)]);
    }
}

export default SetNameInteraction;