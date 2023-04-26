import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, EmbedBuilder, InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, StringSelectMenuBuilder } from "discord.js";
import Locale from "../classes/locale.js";
import { v1 } from "uuid";
import EvadesData from "../evadesData.js";
import Utils from "../classes/utils.js";
import { DiscordUserData } from "../classes/data.js";

class EloInteraction extends DefaultInteraction {
    static name = "elo";
    static applicationCommand = new SlashCommandBuilder()
        .setName(EloInteraction.name)
        .setDescription("ELO tools.")
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
        super(EloInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.matches = new Map();
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

    async execute(interaction) {
        if (!interaction.client.sheets) return "Unuseable!";
        const subcommand = interaction?.options?.getSubcommand(false) ?? interaction.customId.split("/")[1];

        if (subcommand == "check") {
            const username = interaction.options.getString("username");
            const data = await interaction.client.sheets.getELOData();
            const elo = data.get(username) ?? 1200;
            return `${username} has ${elo} ELO.`;
        }

        if (subcommand == "match") { // Matchmaking
            const userData = await DiscordUserData.getByID(interaction.user.id);
            if (!userData.username)
                return Locale.text(interaction, "USERNAME_NOT_SET");
            const username = userData.username;
            const data = await interaction.client.sheets.getELOData();
            const thisELO = data.get(username) ?? 1200;
            let foundMatch = null;
            let cancelFindingMatch = false;
            for (const match of this.matches.values()) {
                if (match.state !== Match.State.OPEN) continue;
                if (match.user1 == interaction.user || match.user2 == interaction.user) {
                    cancelFindingMatch = true;
                    break;
                }
                if (this.determineFairMatch(thisELO, match.elo1)) {
                    foundMatch = match.setOpponent(interaction.user, username, thisELO);
                    break;
                }
            }
            if (cancelFindingMatch) {
                return { content: "You can't participate in an ELO match right now! Are you already searching for a match?", ephemeral: true }
            }
            if (foundMatch) {
                // We now know that two users are available.
                const embed = new EmbedBuilder()
                    .setTitle("Match found!")
                    .setDescription(`${foundMatch.username1} will be going against ${foundMatch.username2}!\n\nChoose your servers and you'll need to pick between the following maps & heroes.`)
                
                // Get maps and heroes.
                const allowedMaps = thisELO >= 1500 ? EvadesData.maps : EvadesData.maps.filter(map => !map.includes("Hard") && map !== "Catastrophic Core");
                const heroes = Utils.randomElements(EvadesData.heroes, 3);
                const maps = Utils.randomElements(allowedMaps, 7);

                foundMatch.setChoices(heroes, maps);

                embed.addFields(
                    {
                        name: "Heroes:",
                        value: heroes.join("\n")
                    },
                    {
                        name: "Maps:",
                        value: maps.join("\n")
                    }
                )
                
                const menu = new StringSelectMenuBuilder()
                    .setCustomId(`elo/maps/${foundMatch.id}`)
                    .setPlaceholder("Map vetoes")
                    .setMinValues(1)
                    .setMaxValues(1)
                
                for (const map of maps) {
                    if (!map) continue;
                    menu.addOptions(
                        {
                            label: map,
                            value: map
                        }
                    )
                }
                
                const row = new ActionRowBuilder().addComponents(menu);

                return {
                    content: `${foundMatch.user1} & ${foundMatch.user2}`,
                    embeds: [embed],
                    components: [row]
                }
            }

            // No match found. Create a new one.
            const match = new Match(interaction.user, username, thisELO);
            this.matches.set(match.id, match);

            return { content: `Hold on, ${username}! We're going to try to find you a fair match...` }
        }

        if (subcommand == "maps") {
            const matchId = interaction.customId.split("/")[2];
            let match = this.matches.get(matchId);
            if (!match)
                return Locale.text(interaction, "COMMAND_ERROR");

            if (match.user1.id !== interaction.user.id && match.user2.id !== interaction.user.id)
                return Locale.text(interaction, "NOT_IN_MATCH");
            
            if (match.usersWhoVetoed.filter(id => id === interaction.user.id).length >= 2)
                return Locale.text(interaction, "ALREADY_SELECTED_MAP");

            const mapToVeto = interaction.values[0];
            if (!match.maps.includes(mapToVeto))
                return Locale.text(interaction, "MAP_ALREADY_REMOVED");

            match.maps = match.maps.filter(map => map != mapToVeto);
            match.usersWhoVetoed.push(interaction.user.id);
            this.matches.set(match.id, match);
            
            const embed = new EmbedBuilder()
                .setTitle("Match found!")
                .setDescription(`${match.username1} will be going against ${match.username2}!\n\nChoose your servers and you'll need to pick between the following maps & heroes.`)

            embed.addFields(
                {
                    name: "Heroes:",
                    value: match.heroes.join("\n")
                },
                {
                    name: "Maps:",
                    value: match.maps.join("\n")
                }
            )
                
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`elo/maps/${match.id}`)
                .setPlaceholder("Map vetoes")
                .setMinValues(1)
                .setMaxValues(1)
                
            for (const map of match.maps) {
                menu.addOptions(
                    {
                        label: map,
                        value: map
                    }
                )
            }
            
            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.update({embeds: [embed], components: [row]})
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
        this.id = v1();
        this.createdAt = Date.now();
        this.state = Match.State.OPEN;
        this.user1 = user1;
        this.user2 = user2;
        this.username1 = username1;
        this.username2 = username2;
        this.elo1 = elo1;
        this.elo2 = elo2;
        this.heroes = [];
        this.maps = [];
        this.usersWhoVetoed = [];
    }

    setChoices(heroes, maps) {
        this.heroes = heroes;
        this.maps = maps;
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