import Utils from "./utils.js";

class Locale {
    static defaultLocale = "en-GB";

    static map = {
        "en-GB": Utils.readJSON("data/locale/en-GB.json"),
        "fr": Utils.readJSON("data/locale/fr.json")
    }

    static text(interaction, key, args = null) {
        // Return the text associated with the key.
        if (args === null) {
            args = [];
        }
        let text = Locale.map[interaction?.locale]?.[key]
            ?? Locale.map[Locale.defaultLocale]?.[key]
            ?? `Locale key error: ${key}`;
        for (let i = 0; i < args.length; i += 1) {
            text = text.replaceAll(`{${i}}`, args[i]);
        }
        return text;
    }

    static defaultText(key) {
        return Locale.map[Locale.defaultLocale]?.[key]
            ?? `Locale key error: ${key}`;
    }

    static getLocaleMap(key) {
        return Object.fromEntries(Object.keys(Locale.map).map(locale => [locale, Locale.map[locale]?.[key] ?? Locale.map[Locale.defaultLocale]?.[key] ?? `Locale key error: ${key}`]));
    }
}

export default Locale;