import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    static DEBUG = Boolean(process.env.DEBUG) ?? false;
    static TOURNAMENT_ORGANIZER_ROLES = process.env.TOURNAMENT_ORGANIZER_ROLES?.split(",") ?? "644345517693861888".split(",");
    static TOURNAMENT_SPECTATOR_ROLES = process.env.TOURNAMENT_SPECTATOR_ROLES?.split(",") ?? "617185571252600961".split(",");
    static MODERATOR_ROLES = process.env.MODERATOR_ROLES?.split(",") ?? "410499884550979594,666388658114396170,437333322247569410,437333568683769866,566679508640595978".split(",");
}

export default Config;