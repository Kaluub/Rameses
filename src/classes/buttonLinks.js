import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { WikiPageData } from "./data.js";

class ButtonLinks {
    constructor(text, links) {
        this.text = text ?? "";
        this.links = links ?? [];
    }

    async parseFromString() {
        this.links = [];
        const separated = this.text.split("\n");
        const seen = new Set();
        for (const label of separated) {
            const page = await WikiPageData.getByTitle(label);
            if (!page || seen.has(page.uuid)) {
                continue;
            }
            seen.add(page.uuid);
            this.links.push({ "label": label, "uuid": page.uuid });
        }
        return this.links;
    }

    parseFromArray() {
        const rows = [new ActionRowBuilder()];
        let index = 0;
        for (const link of this.links) {
            if (rows[index].components.length >= 5) {
                if (index >= 4)
                    break;
                rows.push(new ActionRowBuilder());
                index += 1;
            }

            const button = new ButtonBuilder()
                .setCustomId("wiki/page/" + link.uuid)
                .setStyle(ButtonStyle.Primary)
                .setLabel(link.label)

            rows[index].addComponents(button);
        }
        return rows;
    }

    parseToString() {
        this.text = "";
        for (const link of this.links.slice(0, 25)) {
            this.text += link.label + "\n"
        }
        this.text = this.text.trim();
        return this.text;
    }
}

export default ButtonLinks;