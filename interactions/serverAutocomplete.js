import DefaultInteraction from "../classes/defaultInteraction.js";
import { InteractionType } from "discord.js";

const serverChoices = [
    { name: "all of NA", value: "na" },
    { name: "all of EU", value: "eu" },
    { name: "NA 1", value: "na:0" },
    { name: "NA 2", value: "na:1" },
    { name: "NA 3", value: "na:2" },
    { name: "NA 4", value: "na:3" },
    { name: "NA 5", value: "na:4" },
    { name: "NA 6", value: "na:5" },
    { name: "NA 7", value: "na:6" },
    { name: "NA 8", value: "na:7" },
    { name: "NA 9", value: "na:8" },
    { name: "NA 10", value: "na:9" },
    { name: "NA 11", value: "na:10" },
    { name: "NA 12", value: "na:11" },
    { name: "EU 1", value: "eu:0" },
    { name: "EU 2", value: "eu:1" },
    { name: "EU 3", value: "eu:2" },
    { name: "EU 4", value: "eu:3" },
    { name: "EU 5", value: "eu:4" },
    { name: "EU 6", value: "eu:5" },
    { name: "EU 7", value: "eu:6" },
    { name: "EU 8", value: "eu:7" },
    { name: "EU 9", value: "eu:8" },
    { name: "EU 10", value: "eu:9" },
    { name: "EU 11", value: "eu:10" },
    { name: "EU 12", value: "eu:11" }
]

class ServerInteraction extends DefaultInteraction {
    static name = "server";

    constructor() {
        super(ServerInteraction.name, [InteractionType.ApplicationCommandAutocomplete]);
    }

    async execute(interaction) {
        const search = interaction.options.getFocused();
        const servers = serverChoices
            .filter(server => server.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 25)

        const response = [];
        for (const server of servers) {
            response.push(server);
        }
        
        await interaction.respond(response);
    }
}

export default ServerInteraction;