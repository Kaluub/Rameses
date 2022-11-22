import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    static DEBUG = Boolean(process.env.DEBUG) ?? false;
    static TOURNAMENT_ORGANIZER_ROLE = process.env.TOURNAMENT_ORGANIZER_ROLE ?? "644345517693861888";
    static TOURNAMENT_SPECTATOR_ROLE = process.env.TOURNAMENT_SPECTATOR_ROLE ?? "617185571252600961";
    static MODERATOR_ROLE = process.env.MODERATOR_ROLE ?? "666388658114396170"
}

export default Config;