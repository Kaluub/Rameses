import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    static TOKEN = Config.required(process.env.TOKEN, "TOKEN");
    static DEBUG = Config.parseBoolean(process.env.DEBUG);
    static DEVELOPMENT_SERVER = process.env.DEVELOPMENT_SERVER ?? null;

    static WIKI_ADMIN_ROLES = Config.parseList(process.env.WIKI_ADMIN_ROLES, ["1067888625339076648"]);
    static TOURNAMENT_ORGANIZER_ROLES = Config.parseList(process.env.TOURNAMENT_ORGANIZER_ROLES, ["644345517693861888"]);
    static TOURNAMENT_SPECTATOR_ROLES = Config.parseList(process.env.TOURNAMENT_SPECTATOR_ROLES, ["617185571252600961"]);
    static MODERATOR_ROLES = Config.parseList(process.env.MODERATOR_ROLES, ["410499884550979594", "666388658114396170", "437333322247569410", "437333568683769866", "566679508640595978"]);
    
    static REPOSITORY_LINK = process.env.REPOSITORY_LINK ?? "https://github.com/Kaluub/Rameses/";
    static SERVER_INVITE = process.env.SERVER_INVITE ?? "https://discord.gg/j7fPN2xqBp";
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