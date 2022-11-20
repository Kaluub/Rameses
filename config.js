import * as dotenv from 'dotenv';
dotenv.config();

class Config {
    static TOURNAMENT_ORGANIZER_ROLE = process.env.TOURNAMENT_ORGANIZER_ROLE ?? "644345517693861888";
    static TOURNAMENT_SPECTATOR_ROLE = process.env.TOURNAMENT_SPECTATOR_ROLE ?? "617185571252600961";
}

export default Config;