import DefaultInteraction from "../defaultInteraction.js";
import { EmbedBuilder, InteractionType, SlashCommandBuilder } from "discord.js";

class OnlinePlayersInteraction extends DefaultInteraction {
    static name = "online-players";
    static applicationCommand = new SlashCommandBuilder()
        .setName(OnlinePlayersInteraction.name)
        .setDescription("See the currently online players")

    constructor() {
        super(OnlinePlayersInteraction.name, [InteractionType.ApplicationCommand, InteractionType.MessageComponent]);
        this.defer = true;
    }

    async execute(interaction) {
        const onlinePlayers = await interaction.client.evadesAPI.getOnlinePlayers();
        if(!onlinePlayers) return "Couldn't connect to Evades!";
        let onlinePlayersString = onlinePlayers.join("; ").replaceAll("_", "\\_").replaceAll("*", "\\*").replaceAll("|", "\\|");
        if(onlinePlayersString.length > 1900) onlinePlayersString = onlinePlayersString.substring(0, 1900) + "...";
        const embed = new EmbedBuilder()
            .setTitle("Players currently online:")
            .setColor("#338866")
            .setTimestamp()
            .setDescription(onlinePlayersString.length ? onlinePlayersString : "No players online!")
            .setFooter({text: `${onlinePlayers.length} players online`})
        return { embeds: [embed] }
    }
}

export default OnlinePlayersInteraction;