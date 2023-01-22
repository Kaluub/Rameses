import DefaultInteraction from "../classes/defaultInteraction.js";
import { EmbedBuilder, escapeMarkdown, InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";

class EloInteraction extends DefaultInteraction {
    static name = "elo";
    static applicationCommand = new SlashCommandBuilder()
        .setName(EloInteraction.name)
        .setDescription("ELO tools.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("match")
                .setDescription("Find an opponent to battle with!")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("Your in-game name here!")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
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
        super(EloInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
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
        for (const bracket of this.brackets) {
            if ((bracket.min <= elo) && (elo < bracket.max)) {
                targetBracket = bracket;
                break;
            }
        }
        return targetBracket;
    }

    determineFairMatch(elo1, elo2) {
        const bracket1 = this.determineBracket(elo1);
        const bracket2 = this.determineBracket(elo2);

        if (bracket1 == bracket2) return true;
        if (elo1 >= bracket2.min - bracket2.leeway) return true;
        if (elo2 >= bracket1.min - bracket1.leeway) return true;
        return false;
    }

    getELOFromUsername(username, data) {
        let elo = 1200;
        for (const eloData of data) {
            if (eloData[0].toLowerCase() === username.toLowerCase()) {
                elo = parseInt(eloData[1]);
                break;
            }
        }
        return elo;
    }

    async execute(interaction) {
        if (!interaction.client.sheets) return "Unuseable!";
        const subcommand = interaction?.options?.getSubcommand(false) ?? interaction.customId.split("/")[1];
        if (subcommand == "test") {
            return "☻" //JSON.stringify([this.determineBracket(400), this.determineBracket(26044), this.determineBracket(1900), this.determineBracket(1300), this.determineBracket(1500)], null, 4)
        }
        if (subcommand == "check") {
            const username = interaction.options.getString("username");
            const data = await interaction.client.sheets.getELOData(); // Format: [[Username1, ELO1], [Username2, ELO2]];
            const elo = this.getELOFromUsername(username, data);
            return `${username} has ${elo} ELO.`;
        }
        if (subcommand == "match") { // Matchmaking
            const username = interaction.options.getString("username");
            const data = await interaction.client.sheets.getELOData();
            const thisELO = this.getELOFromUsername(username, data);
            let foundMatch = null;
            let cancelFindingMatch = false;
            for (const match of this.matches) {
                if (match.state !== Match.State.OPEN) continue;
                if (match.user1 == interaction.user || match.user2 == interaction.user) {
                    cancelFindingMatch = true;
                    break;
                }
                console.log(this.determineFairMatch(thisELO, match.elo1))
                if (this.determineFairMatch(thisELO, match.elo1)) {
                    matchFound = match.setOpponent(interaction.user, username, thisELO);
                    break;
                }
            }
            if (cancelFindingMatch) {
                return { content: "You can't participate in an ELO match right now! Are you already searching for a match?", ephemeral: true }
            }
            if (foundMatch) { // We now know that two users are available.
                this.matches.slice(this.matches.findIndex(foundMatch), 1);
                const embed = new EmbedBuilder()
                    .setTitle("Match found!")
                    .setDescription(`${foundMatch.username1} will be going against ${foundMatch.username2}!\n\nPick your servers and you'll need to pick between the following maps & heroes.`)
                return { content: `${foundMatch.user1} & ${foundMatch.user2}`, embeds: [] }
            }
        }
        return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
    }
}

class Match {
    static State = {
        OPEN: 1,
        CLOSED: 2
    }

    constructor(user1, username1, elo1, user2 = null, username2 = null, elo2 = null) {
        this.createdAt = Date.now();
        this.state = Match.State.OPEN;
        this.user1 = user1;
        this.user2 = user2;
        this.username1 = username1;
        this.username2 = username2;
        this.elo1 = elo1;
        this.elo2 = elo2;
    }

    setOpponent(opponentUser, opponentUsername, opponentElo) {
        this.state = Match.State.CLOSED;
        this.user2 = opponentUser;
        this.username2 = opponentUsername;
        this.elo2 = opponentElo;
        return this;
    }
}

export default EloInteraction;