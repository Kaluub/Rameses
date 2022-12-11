import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordUserData } from "../data.js";

class FriendInteraction extends DefaultInteraction {
    static name = "friend";
    static applicationCommand = new SlashCommandBuilder()
        .setName(FriendInteraction.name)
        .setDescription("Friend management. Hard, I know.")
        .setDMPermission(false)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("add")
                .setDescription("Add someone as a friend. Lovebird.")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("The username of the player")
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
                        .setDescription("The username of the friend you're about to remove")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )

    constructor() {
        super(FriendInteraction.name, [InteractionType.ApplicationCommand, InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        if(interaction.isAutocomplete()) {
            const userData = await DiscordUserData.getByID(interaction.user.id);
            const response = [];
            for(const username of userData.friends.filter(username => username.includes(interaction.options.getFocused() ?? ""))) {
                response.push({name: username, value: username});
                if(response.length >= 25) break;
            }
            await interaction.respond(response);
        }
        if(interaction.isChatInputCommand()) {
            const subcommand = interaction.options.getSubcommand(false);
            if(subcommand == "add") {
                const userData = await DiscordUserData.getByID(interaction.user.id);
                const username = interaction.options.getString("username").toLowerCase();
                if(userData.friends.includes(username)) return "You're already friends with them.";
                userData.friends.push(username);
                await userData.save();
                return "You've added them as a friend!";
            }
            if(subcommand == "remove") {
                let userData = await DiscordUserData.getByID(interaction.user.id);
                const username = interaction.options.getString("friend").toLowerCase();
                if(!userData.friends.includes(username)) return "You're not friends with them.";
                userData.friends = userData.friends.filter(friend => friend !== username)
                await userData.save();
                return "You've removed them as a friend!";
            }
            return "How did we get here?"
        }
    }
}

export default FriendInteraction;