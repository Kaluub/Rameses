import DefaultInteraction from "../classes/defaultInteraction.js";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordUserData } from "../classes/data.js";
import Locale from "../classes/locale.js";

class FriendInteraction extends DefaultInteraction {
    static name = "friend";
    static applicationCommand = new SlashCommandBuilder()
        .setName(FriendInteraction.name)
        .setDescription("Friend management. Hard, I know.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("add")
                .setDescription("Add someone as a friend, hoisting them in the online players list.")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("The username of the player to add as a friend.")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("remove")
                .setDescription("Remove someone as a friend. Heartbreaker.")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("friend")
                        .setDescription("The username of the friend you're about to remove.")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("list")
                .setDescription("See a list of all your added friends.")
        )

    constructor() {
        super(FriendInteraction.name, [InteractionType.ApplicationCommand, InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            const userData = await DiscordUserData.getByID(interaction.user.id);
            const response = [];
            for (const username of userData.friends.filter(username => username.includes(interaction.options.getFocused() ?? ""))) {
                response.push({ name: username, value: username });
                if (response.length >= 25) {
                    break;
                }
            }
            await interaction.respond(response);
        }
        
        if (interaction.isChatInputCommand()) {
            const subcommand = interaction.options.getSubcommand(false);
            if (subcommand === "add") {
                const userData = await DiscordUserData.getByID(interaction.user.id);
                const username = interaction.options.getString("username").toLowerCase();

                if (userData.friends.includes(username)) {
                    return Locale.text(interaction, "FRIENDS_ALREADY");
                }

                userData.friends.push(username);
                await userData.save();

                return Locale.text(interaction, "FRIEND_ADDED");
            }

            if (subcommand === "remove") {
                let userData = await DiscordUserData.getByID(interaction.user.id);
                const username = interaction.options.getString("friend").toLowerCase();

                if (!userData.friends.includes(username)) {
                    return Locale.text(interaction, "NOT_FRIENDS");
                }

                userData.friends = userData.friends.filter(friend => friend !== username)
                await userData.save();

                return Locale.text(interaction, "FRIEND_REMOVED");
            }

            if (subcommand === "list") {
                const userData = await DiscordUserData.getByID(interaction.user.id);
                const sortedFriends = userData.friends.sort((f1, f2) => f1 - f2);

                const embed = new EmbedBuilder()
                    .setTitle(Locale.text(interaction, "FRIEND_LIST"))
                    .setColor("#a5b1d3")
                    .setTimestamp();
                
                let description = 'Friends:\n';
                let addSemicolon = false;
                for (const friend of sortedFriends) {
                    let friendText = addSemicolon ? `; ${friend}` : friend;
                    if (description.length + friendText.length > 1995) {
                        description += '...';
                        break;
                    }
                    description += friendText;
                    addSemicolon = true;
                }

                embed.setDescription(description);

                return { embeds: [embed] }
            }
            return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
        }
    }
}

export default FriendInteraction;