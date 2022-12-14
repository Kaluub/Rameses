import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, PermissionsBitField, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandRoleOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { DiscordGuildData } from "../data.js";
import { hasPermission } from "../utils.js";

class ConfigInteraction extends DefaultInteraction {
    static name = "configure";
    static applicationCommand = new SlashCommandBuilder()
        .setName(ConfigInteraction.name)
        .setDescription("Configure some guild-related settings here.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
        .addSubcommandGroup(
            new SlashCommandSubcommandGroupBuilder()
                .setName("tournament")
                .setDescription("Tournament-related configurations.")
                .addSubcommand(new SlashCommandSubcommandBuilder()
                    .setName("spectators")
                    .setDescription("Set the servers' tournament spectator role.")
                    .addRoleOption(new SlashCommandRoleOption()
                        .setName("role")
                        .setDescription("The role to use as the tournament spectators role.")
                        .setRequired(true)
                    )
                )
                .addSubcommand(new SlashCommandSubcommandBuilder()
                    .setName("organizers")
                    .setDescription("Set the servers' tournament organizer role.")
                    .addRoleOption(new SlashCommandRoleOption()
                        .setName("role")
                        .setDescription("The role to use as the tournament spectators role.")
                        .setRequired(true)
                    )
                )
                .addSubcommand(new SlashCommandSubcommandBuilder()
                    .setName("check-names")
                    .setDescription("Decide whether the bot should check if a username exists in Evades.io, useful for other games.")
                    .addBooleanOption(new SlashCommandBooleanOption()
                        .setName("should-check")
                        .setDescription("Decide whether the bot should check if a username exists in Evades.io, useful for other games.")
                        .setRequired(true)
                    )
                )
        )

    constructor() {
        super(ConfigInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if(subcommandGroup == "tournament") {
            if(!hasPermission(interaction, PermissionsBitField.Flags.ManageGuild, interaction.user)) return "You need to have the permission to manage this server to make this change!"
            if(!interaction.guild) return "Only in servers.";
            if(subcommand == "spectators") {
                let guildData = await DiscordGuildData.getByID(interaction.guild.id);
                const role = interaction.options.getRole("role");
                if(guildData.tournamentSpectatorRole == role.id) return "Your server already has this as the spectators role!";
                guildData.tournamentSpectatorRole = role.id;
                await guildData.save();
                return "The tournament spectators role has been set!";
            }
            if(subcommand == "organizers") {
                let guildData = await DiscordGuildData.getByID(interaction.guild.id);
                const role = interaction.options.getRole("role");
                if(guildData.tournamentOrganizerRole == role.id) return "Your server already has this as the organizers role!";
                guildData.tournamentOrganizerRole = role.id;
                await guildData.save();
                return "The tournament organizers role has been set!";
            }
            if(subcommand == "check-names") {
                let guildData = await DiscordGuildData.getByID(interaction.guild.id);
                const shouldCheck = interaction.options.getBoolean("should-check");
                guildData.forceAccountExistence = shouldCheck;
                await guildData.save();
                return "Your changes were stored!";
            }
        }
        return "How did we get here?";
    }
}

export default ConfigInteraction;