import DefaultInteraction from "../defaultInteraction.js";
import { InteractionType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { tournamentFormatter } from "../utils.js";
import Config from "../config.js";
import { TournamentData } from "../data.js";

class TournamentAddInteraction extends DefaultInteraction {
    static name = "tournament-add";

    constructor() {
        super(TournamentAddInteraction.name, [InteractionType.ModalSubmit, InteractionType.MessageComponent]);
    }

    async execute(interaction) {
        if(!interaction.member) return "Please use this in the Discord server.";
        if(!interaction.member.roles.cache.hasAny(Config.TOURNAMENT_SPECTATOR_ROLE, Config.TOURNAMENT_ORGANIZER_ROLE, Config.MODERATOR_ROLE)) return {content: "You need to be a Tournament Spectator to use this tool!", ephemeral: true};
        if(interaction.isMessageComponent()) {
            const tournament = await TournamentData.getByID(interaction.message.id);
            if(!tournament) return {content: "The tournament data could not be found! Contact a Tournament Organizer about this!", ephemeral: true};
            if(Date.now() > tournament.created + tournament.duration) {
                // Remove button or something later
                return {ephemeral: true, content: "This tournament is over!"};
            }
            const modal = new ModalBuilder()
                .setCustomId(`tournament-add/${tournament.id}/${interaction.channel.id}`)
                .setTitle("Add tournament run")
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("player")
                                .setLabel("Player(s):")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("Name the player(s) you spectated! Exact usernames, please.")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("area")
                                .setLabel("Area:")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("The area the player(s) made it to. Example: 'Area 35'.")
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("time")
                                .setLabel("Time:")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("The time it took to reach the area above. Example: '5:04'.")
                        )
                )
            return await interaction.showModal(modal);
        }
        if(interaction.isModalSubmit()) {
            if(!interaction.member) return "Please use this in the Discord server.";
            if(!interaction.member.roles.cache.hasAny(Config.TOURNAMENT_SPECTATOR_ROLE, Config.TOURNAMENT_ORGANIZER_ROLE, Config.MODERATOR_ROLE)) return {content: "You need to be a Tournament Spectator to use this tool!", ephemeral: true};
            const args = interaction.customId.split("/");
            const tournament = await TournamentData.getByID(args[1]);
            if(!tournament) return {content: "The tournament data could not be found! Contact a Tournament Organizer about this!", ephemeral: true};
            if(Date.now() > tournament.created + tournament.duration) {
                // Remove button or something later
                return {ephemeral: true, content: "This tournament is over!"};
            }
            let player = interaction.fields.getTextInputValue("player");
            let area = interaction.fields.getTextInputValue("area");
            let time = interaction.fields.getTextInputValue("time");
            if(!player || !area || !time) return {ephemeral: true, content: "Invalid/blank values!"};
            if(tournament.leaderboard.filter(r => player.toLowerCase() == r.player.toLowerCase()).length >= tournament.maxAttempts) return {ephemeral: true, content: `${player} has already done the maximum amount of runs this tournament!`}
            if(area.startsWith("Area ")) {
                const aNumber = parseInt(area.split(" ")[1])
                if(isNaN(aNumber)) return {ephemeral: true, content: "The area must be either 'Area [Number]' or 'Victory!'"};
                if(aNumber < 1) return {ephemeral: true, content: "The area must be 1 or higher!"};
            }
            if(!area.startsWith("Area ") && area != "Victory!") {
                const aNumber = parseInt(area);
                if(!aNumber)
                    return {ephemeral: true, content: "The area must be either 'Area [Number]' or 'Victory!'"};
                if(aNumber < 1) return {ephemeral: true, content: "The area must be 1 or higher!"};
                area = `Area ${parseInt(area)}`;
            }
            let timeSegments = time.split(":");
            let timeSeconds = 0;
            if(timeSegments.length == 2) {
                if(timeSegments[1] > 59) return {ephemeral: true, content: "The time must follow the format '[Minutes]:[Seconds]' (example: 5:55)"};
                timeSeconds += parseInt(timeSegments[0]) * 60 + parseInt(timeSegments[1]);
            } else return {ephemeral: true, content: "The time must be '[Minutes]:[Seconds]' (example: 5:55)"};
            if(isNaN(timeSeconds)) return {ephemeral: true, content: "The time must follow the format '[Minutes]:[Seconds]' (example: 5:55)"};
            if(timeSeconds < 0) return {ephemeral: true, content: "Negative time doesn't exist! Probably."};
            tournament.leaderboard.push({player, area, time: time.trim(), timeSeconds, spectator: interaction.user.id });
            await tournament.save();
            const channel = interaction.client.channels.cache.get(args[2]);
            if(!channel) return {content: "The tournament channel could not be found! Contact a Tournament Organizer about this!", ephemeral: true};
            const message = await channel.messages.fetch(tournament.id);
            if(!message) return {content: "The tournament message could not be found! Contact a Tournament Organizer about this!", ephemeral: true};
            if(!message.editable) return {content: "The tournament message could not be edited! Contact a Tournament Organizer about this!", ephemeral: true};
            await message.edit({content: tournamentFormatter(tournament)});
            return {content: "Added the run successfully.", ephemeral: true};
        }
    }
}

export default TournamentAddInteraction;