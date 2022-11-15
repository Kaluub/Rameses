import { Collection } from "discord.js";
import { readdirSync } from "fs";

class InteractionLogger {
    constructor(path) {
        this.path = path;
    }
}

class InteractionHandler {
    constructor() {
        this.interactions = new Collection();
        this.logger = new InteractionLogger("./logs");
        this.loadInteractions("./interactions");
    };

    loadInteractions(path) {
        this.interactions.clear();
        const files = readdirSync(path).filter(file => file.endsWith('.js'));
        files.forEach(async file => {
            const { default: InteractionClass } = await import(`${path}/${file}`);
            if(!InteractionClass.disabled) this.interactions.set(InteractionClass.name, new InteractionClass());
        });
    };

    async getApplicationCommands() {
        const applicationCommands = [];
        const files = readdirSync("./interactions").filter(file => file.endsWith('.js'));
        for(const file of files) {
            const { default: InteractionClass } = await import(`./interactions/${file}`);
            if(!InteractionClass.disabled && InteractionClass.applicationCommand)
                applicationCommands.push(InteractionClass.applicationCommand.toJSON())
        };
        return applicationCommands;
    }

    async handleInteraction(interaction) {
        const interactionHandler = this.interactionHandler.interactions.get(interaction.commandName ?? interaction.customId);
        if(!interactionHandler) return await interaction.reply({content: "Something went seriously wrong if you're seeing this! (Command not found)", ephemeral: true});
        if(interactionHandler.defer) await interaction.deferReply();
        interactionHandler.execute(interaction)
            .then(async response => {
                if(interaction.deferred)
                    await interaction.editReply(response)
                else if(!interaction.replied)
                    await interaction.reply(response)
            })
            .catch(async err => {
                console.error(err)
                if(interaction.deferred)
                    await interaction.editReply({content: "Something went seriously wrong if you're seeing this! (Command failed)"})
                if(!interaction.replied)
                    await interaction.reply({content: "Something went seriously wrong if you're seeing this! (Command failed)", ephemeral: true});
            })

    }
}

export default InteractionHandler;