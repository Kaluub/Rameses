class DefaultInteraction {
    static disabled = false;
    static applicationCommand = null;
    
    constructor(name, interactionTypes = []) {
        this.name = name;
        this.interactionTypes = interactionTypes;
        this.defer = false;
    }

    isValidInteractionType(interaction) {
        return this.interactionTypes.length ? this.interactionTypes.includes(interaction.type) : true;
    }

    async execute(interaction) {
        return "Default value";
    }
}

export default DefaultInteraction;