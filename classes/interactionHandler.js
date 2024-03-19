import { Collection } from "discord.js";
import { readdirSync } from "fs";
import Locale from "./locale.js";

class InteractionHandler {
    constructor() {
        this.interactions = new Collection();
        this.loadInteractions();
    };

    loadInteractions() {
        this.interactions.clear();
        const files = readdirSync("./interactions").filter(file => file.endsWith(".js"));
        files.forEach(async file => {
            const { default: InteractionClass } = await import(`../interactions/${file}`);
            if (!InteractionClass.disabled) {
                this.interactions.set(InteractionClass.name, new InteractionClass());
            }
        });
    };

    async setApplicationCommands(client) {
        const applicationCommands = [];
        const files = readdirSync("./interactions").filter(file => file.endsWith('.js'));
        for (const file of files) {
            const { default: InteractionClass } = await import(`../interactions/${file}`);
            if (!InteractionClass.isGlobalInteraction) {
                for (const guildId of InteractionClass.guilds) {
                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) {
                        continue;
                    }
                    await guild.commands.create(InteractionClass.applicationCommand.toJSON())
                        .catch(console.error);
                }
                continue;
            }
            if (!InteractionClass.disabled && InteractionClass.applicationCommand) {
                applicationCommands.push(InteractionClass.applicationCommand.toJSON());
            }
        };
        await client?.application.fetch();
        await client?.application.commands.set(applicationCommands);
    }

    async handleDefer(interaction, interactionHandler) {
        if (interaction.isAutocomplete()) {
            return;
        }
        try {
            if (interactionHandler.updateIfComponent && interaction.isMessageComponent()) {
                await interaction.deferUpdate({ ephemeral: interactionHandler.ephemeral ? true : false });
            } else {
                await interaction.deferReply({ ephemeral: interactionHandler.ephemeral ? true : false });
            }
        } catch {
            return;
        }
    }

    async handleInteraction(interaction) {
        let interactionHandler = this.interactionHandler.interactions.get(interaction?.commandName ?? interaction?.customId?.split("/")[0]);
        if (interaction.isAutocomplete()) {
            interactionHandler = this.interactionHandler.interactions.get(interaction.options.getFocused(true).name);
        }
        if (!interactionHandler) {
            return await interaction.reply({ content: Locale.text(interaction, "COMMAND_ERROR_NOT_FOUND"), ephemeral: true });
        }
        if (interactionHandler.defer) {
            await this.interactionHandler.handleDefer(interaction, interactionHandler);
        }
        interactionHandler.execute(interaction)
            .then(async response => {
                if (interaction.isAutocomplete()) {
                    return;
                }
                if (!response) {
                    return;
                }

                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply(response);
                } else if (!interaction.replied) {
                    await interaction.reply(response);
                }
            })
            .catch(err => {
                console.error(err);
            })
    }
}

export default InteractionHandler;