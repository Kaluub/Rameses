import DefaultInteraction from "../classes/defaultInteraction.js";
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionContextType, InteractionType, SlashCommandBuilder } from "discord.js";
import { AccountData } from "../classes/data.js";
import Locale from "../classes/locale.js";
import Utils from "../classes/utils.js";

class SeenInteraction extends DefaultInteraction {
    static name = "seen";
    static applicationCommand = new SlashCommandBuilder()
        .setName(SeenInteraction.name)
        .setDescription("Check who has been online recently.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)

    constructor() {
        super(SeenInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
        this.updateIfComponent = true;
    }

    async execute(interaction) {
        const limit = Math.min(this.getIntegerArgument(interaction, "limit", 1), 50) || 25;
        const offset = Math.max(this.getIntegerArgument(interaction, "offset", 2), 0) || 0;
        const accounts = await AccountData.getRecentlyOnline(limit, offset).toArray();
        
        if (!accounts.length)
            return Locale.text(interaction, "NO_MATCHES");
        
        let string = Locale.text(interaction, "SEEN");
        let i = 0 + offset;
        
        for (const account of accounts) {
            i += 1;
            string += `\n**${i}.** ${Utils.sanitizeUsername(account.displayName ?? account.username)}: <t:${account.lastSeen}:R>`;
        }

        const playersOnlinePastDay = await AccountData.count({ lastSeen: { $gte: Math.floor(Date.now() / 1000) - 60 * 60 * 24}});

        const embed = new EmbedBuilder()
            .setColor("#77dd77")
            .setDescription(string)
            .setFooter({ text: Locale.text(interaction, "SEEN_FOOTER", [playersOnlinePastDay.toLocaleString()]) })
            .setTimestamp()
        
        const previousButton = new ButtonBuilder()
            .setCustomId(`seen/${limit}/${offset - limit}`)
            .setDisabled(offset === 0 || accounts.length === 0)
            .setStyle(ButtonStyle.Primary)
            .setLabel(Locale.text(interaction, "NEWER"))
        
        const nextButton = new ButtonBuilder()
            .setCustomId(`seen/${limit}/${offset + limit}`)
            .setDisabled(accounts.length !== limit)
            .setStyle(ButtonStyle.Primary)
            .setLabel(Locale.text(interaction, "OLDER"))
                
        const row = new ActionRowBuilder()
            .addComponents(previousButton, nextButton)

        if (interaction.isMessageComponent()) return await interaction.editReply({ embeds: [embed], components: [row] });
        return { embeds: [embed], components: [row] };
    }
}

export default SeenInteraction;