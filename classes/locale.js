import { readJSON } from "../utils.js";

class Locale {
    static map = {
        "en-GB": readJSON("locales/en-GB.json"),
        "fr": readJSON("locales/fr.json")
    }

    static text(interaction, key, args = []) {
        // Return the text associated with the key.
        return Locale.map[interaction?.locale]?.[key]
            ?.replaceAll("{0}", args?.[0])
            ?.replaceAll("{1}", args?.[1])
            ?.replaceAll("{2}", args?.[2])
            ?? Locale.map["en-GB"]?.[key]
                ?.replaceAll("{0}", args?.[0])
                ?.replaceAll("{1}", args?.[1])
                ?.replaceAll("{2}", args?.[2])
            ?? `Locale key error: ${key}`;
    }
}

export default Locale;