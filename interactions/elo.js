import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";

class EloInteraction extends DefaultInteraction {
    static name = "elo";
    static applicationCommand = new SlashCommandBuilder()
        .setName(EloInteraction.name)
        .setDescription("ELO tools.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("test")
                .setDescription("testing")
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("match")
                .setDescription("Find an opponent to battle with!")
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("check")
                .setDescription("Check the ELO of a user")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("The username to search for")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )

    constructor() {
        super(EloInteraction.name, [InteractionType.ApplicationCommand]);
        this.matches = [];
        this.brackets = [
            { name: "Iron", min: -Infinity, max: 700, leeway: 200 },
            { name: "Bronze", min: 700, max: 1100, leeway: 100 },
            { name: "Silver", min: 1100, max: 1300, leeway: 100 },
            { name: "Gold", min: 1300, max: 1500, leeway: 100 },
            { name: "Diamond", min: 1500, max: 1900, leeway: 100 },
            { name: "Platinum", min: 1900, max: Infinity, leeway: 200 }
        ]
    }

    determineBracket(elo = 1200) {
        let targetBracket = null;
        for(const bracket of this.brackets) {
            if((bracket.min <= elo) && (elo < bracket.max)) {
                targetBracket = bracket;
                break;
            }
        }
        return targetBracket;
    }

    async execute(interaction) {
        if(!interaction.client.sheets) return "Unuseable!"
        const subcommand = interaction.options.getSubcommand(false);
        if(subcommand == "test") {
            return "☻" //JSON.stringify([this.determineBracket(400), this.determineBracket(26044), this.determineBracket(1900), this.determineBracket(1300), this.determineBracket(1500)], null, 4)
        }
        if(subcommand == "check") {
            const data = await interaction.client.sheets.getELOData(); // Format: [[Username1, ELO1], [Username2, ELO2]];
            const username = interaction.options.getString("username");
            let elo = 1200;
            for(const eloData of data) {
                if(eloData[0].toLowerCase() === username.toLowerCase()) {
                    elo = parseInt(eloData[1]);
                    break;
                }
            }
            return `${username} has ${elo} ELO.`;
        }
        if(subcommand == "match") { // Matchmaking

        }
        return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
    }
}

export default EloInteraction;