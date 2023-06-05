import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    static TOKEN = Config.required(process.env.TOKEN, "TOKEN");
    static MONGO_USERNAME = process.env.MONGO_USERNAME;
    static MONGO_PASSWORD = process.env.MONGO_PASSWORD;

    static DEBUG = Config.parseBoolean(process.env.DEBUG);

    static DEVELOPMENT_SERVER = process.env.DEVELOPMENT_SERVER ?? null;
    static ELO_SERVER = process.env.ELO_SERVER ?? null;
    static ELO_RESULTS_CHANNEL = process.env.ELO_RESULTS_CHANNEL ?? "1104476816250507405";
    static WIKI_ADMIN_ROLES = Config.parseList(process.env.WIKI_ADMIN_ROLES, ["1067888625339076648"]);
    static TOURNAMENT_ORGANIZER_ROLES = Config.parseList(process.env.TOURNAMENT_ORGANIZER_ROLES, ["644345517693861888"]);
    static TOURNAMENT_SPECTATOR_ROLES = Config.parseList(process.env.TOURNAMENT_SPECTATOR_ROLES, ["617185571252600961"]);
    static MODERATOR_ROLES = Config.parseList(process.env.MODERATOR_ROLES, ["410499884550979594", "666388658114396170", "437333322247569410", "437333568683769866", "566679508640595978"]);

    static REPOSITORY_LINK = process.env.REPOSITORY_LINK ?? "https://github.com/Kaluub/Rameses/";
    static SERVER_INVITE = process.env.SERVER_INVITE ?? "https://discord.gg/j7fPN2xqBp";

    static GAME_CLIENT_ENABLED = Config.parseBoolean(process.env.GAME_CLIENT_ENABLED);

    static GOOGLE_API_ENABLED = Config.parseBoolean(process.env.GOOGLE_API_ENABLED);
    static GOOGLE_SERVICE_EMAIL = process.env.GOOGLE_SERVICE_EMAIL ?? undefined;
    static GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY ?? undefined;

    static CHROMIUM_EXECUTABLE = process.env.CHROMIUM_EXECUTABLE ?? undefined;

    static required(arg, name) {
        if (!arg) throw `Required .env value not passed! Please set ${name}.`;
        return arg;
    }

    static parseBoolean(arg, def = false) {
        return arg?.toUpperCase() === "TRUE" ?? def;
    }

    static parseList(arg, def = []) {
        return arg?.split(",") ?? def;
    }
}

export default Config;