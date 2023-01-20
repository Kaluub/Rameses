import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType, PermissionsBitField, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandRoleOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import { DiscordGuildData } from "../classes/data.js";
import { hasPermission } from "../utils.js";
import Locale from "../classes/locale.js";

class GuildConfigInteraction extends DefaultInteraction {
    static name = "configure";
    static applicationCommand = new SlashCommandBuilder()
        .setName(GuildConfigInteraction.name)
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
        super(GuildConfigInteraction.name, [InteractionType.ApplicationCommand]);
    }

    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommandGroup == "tournament") {
            if (!hasPermission(interaction, PermissionsBitField.Flags.ManageGuild, interaction.user)) return Locale.text(interaction, "MANAGE_GUILD_PERMISSION_REQUIRED")
            if (!interaction.guild) return Locale.text(interaction, "GUILD_ONLY");
            if (subcommand == "spectators") {
                let guildData = await DiscordGuildData.getByID(interaction.guild.id);
                const role = interaction.options.getRole("role");
                if (guildData.tournamentSpectatorRole == role.id) return Locale.text(interaction, "SPECTATOR_ROLE_ALREADY");
                guildData.tournamentSpectatorRole = role.id;
                await guildData.save();
                return Locale.text(interaction, "SPECTATOR_ROLE_SET");
            }
            if (subcommand == "organizers") {
                let guildData = await DiscordGuildData.getByID(interaction.guild.id);
                const role = interaction.options.getRole("role");
                if (guildData.tournamentOrganizerRole == role.id) return Locale.text(interaction, "ORGANIZER_ROLE_ALREADY");
                guildData.tournamentOrganizerRole = role.id;
                await guildData.save();
                return Locale.text(interaction, "ORGANIZER_ROLE_SET");
            }
            if (subcommand == "check-names") {
                let guildData = await DiscordGuildData.getByID(interaction.guild.id);
                const shouldCheck = interaction.options.getBoolean("should-check");
                guildData.forceAccountExistence = shouldCheck;
                await guildData.save();
                return Locale.text(interaction, "CHANGES_STORED");
            }
        }
        return Locale.text(interaction, "HOW_DID_WE_GET_HERE");
    }
}

export default GuildConfigInteraction;