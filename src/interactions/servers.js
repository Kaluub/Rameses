import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, ContainerBuilder, InteractionContextType, InteractionType, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } from "discord.js";
import Locale from "../classes/locale.js";

class ServersInteraction extends DefaultInteraction {
    static name = "servers";
    static applicationCommand = new SlashCommandBuilder()
        .setName(ServersInteraction.name)
        .setDescription("Check the server counts.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)

    constructor() {
        super(ServersInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const serverStats = await interaction.client.evadesAPI.getServerStats();
        if (serverStats === null) {
            return Locale.text(interaction, "EVADES_ERROR");
        }

        const container = new ContainerBuilder()
            .setAccentColor(0xAED253)
            .addTextDisplayComponents(t => t.setContent(Locale.text(interaction, "SERVERS_HEADER")))
        
        const regions = ["na", "eu"];
        for (const region of regions) {
            const servers = serverStats[region];
            if (!servers) {
                continue;
            }
            let currentRow = null;
            const actionRows = [];
            for (let i = 0; i < Object.keys(servers).length; i++) {
                const server = servers[i.toString()];
                if (i % 4 === 0) {
                    actionRows.push(new ActionRowBuilder());
                    currentRow = actionRows[actionRows.length - 1];
                }
                currentRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`online-players/${region.toLowerCase()}:${i}`)
                        .setLabel(`${region.toUpperCase()} ${i+1}: ${server.connected} player${server.connected != 1 ? 's' : ''}`)
                        .setDisabled(server.connected === 0)
                        .setStyle(ButtonStyle.Primary)
                )
            }

            container.addSeparatorComponents(s => s.setDivider(true));
            container.addActionRowComponents(actionRows);
        }

        container.addTextDisplayComponents(t => t.setContent("-# " + Locale.text(interaction, "PLAYERS_ONLINE_COUNT", [serverStats.connected])));

        return { flags: MessageFlags.IsComponentsV2, components: [container] };
    }
}

export default ServersInteraction;