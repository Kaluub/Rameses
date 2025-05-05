import Locale from "./locale.js";

class DefaultInteraction {
    static disabled = false;
    static applicationCommand = null;
    static isGlobalInteraction = true;
    static guilds = null;

    constructor(name, interactionTypes = []) {
        this.name = name;
        this.interactionTypes = interactionTypes;
        this.defer = false;
        this.ephemeral = false;
        this.updateIfComponent = false;
    }

    isValidInteractionType(interaction) {
        return this.interactionTypes.length ? this.interactionTypes.includes(interaction.type) : true;
    }

    getStringArgument(interaction, name, index) {
        return (interaction?.options?.getString(name) ?? interaction?.customId?.split("/")[index]);
    }

    getIntegerArgument(interaction, name, index) {
        return (interaction?.options?.getInteger(name) ?? parseInt(interaction?.customId?.split("/")[index]));
    }

    getSubcommand(interaction) {
        return (interaction?.options?.getSubcommand(false) ?? interaction?.customId?.split("/")[1]);
    }

    /**
     * @abstract
     * @param {import("discord.js").BaseInteraction} interaction 
     */
    async execute(interaction) {
        return Locale.text(interaction, "DEFAULT_COMMAND");
    }

    /**
     * @abstract
     * @param {import("discord.js").BaseInteraction} interaction
     */
    async tests(interaction) {
        // TODO: Is there a decent way to have some sort of command testing interface?
        return;
    }
}

export default DefaultInteraction;