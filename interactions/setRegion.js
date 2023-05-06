import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { AccountData, DiscordUserData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";

class SetRegionInteraction extends DefaultInteraction {
    static name = "set-region";
    static noGlobalInteraction = true;
    static guilds = [SetRegionInteraction.ELO_SERVER];
    static applicationCommand = new SlashCommandBuilder()
        .setName(SetRegionInteraction.name)
        .setDescription("Set your preffered region here.")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("region")
                .setDescription("Your preferred region.")
                .setRequired(true)
                .addChoices(
                    {
                        "name": "Europe",
                        "value": "EU"
                    },
                    {
                        "name": "North America",
                        "value": "NA"
                    }
                )
        )

    constructor() {
        super(SetRegionInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        let userData = await DiscordUserData.getByID(interaction.user.id);        
        let region = interaction.options.getString("region");
        userData.region = region;
        await userData.save();
        return Locale.text(interaction, "REGION_SET", [region]);
    }
}

export default SetRegionInteraction;