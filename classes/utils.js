import { readFileSync } from "fs";
import TournamentPlayerRunData from "./tournamentRun.js";

class Utils {
    static tournamentFormatter(tournament, full = false) {
        if (tournament.leaderboard?.length <= 0) {
            const fakeRun = new TournamentPlayerRunData();
            fakeRun.list.push({
                player: "Player",
                area: "Area 0",
                timeSeconds: 0,
                time: "0:00",
            });
    
            return "```asciidoc\n= Leaderboard =\n\n" + fakeRun.getString(tournament, 0) + "\n```";
        }
    
        let tournamentString = "```asciidoc\n= Leaderboard =";
        let position = 0;
        let sortedArray = [];
        const usersRuns = {};
    
        for (const run of tournament.leaderboard) {
            const lowerName = run.player.toLowerCase();
            if (!usersRuns[lowerName]) {
                usersRuns[lowerName] = new TournamentPlayerRunData();
            }
            usersRuns[lowerName].list.push(run);
        }
    
        // Sum
        if (tournament.type == "sum") sortedArray = Object.values(usersRuns).sort((e1, e2) => TournamentPlayerRunData.sortElements(e1.total, e2.total));
        // Best
        else sortedArray = Object.values(usersRuns).sort((e1, e2) => TournamentPlayerRunData.sortElements(e1.best, e2.best));
    
        for (const run of sortedArray) {
            position += 1;
            const runString = "\n\n" + run.getString(tournament, position);
            if ((tournamentString + runString).length > 1997 && !full) break;
            tournamentString += runString;
        }
        tournamentString += "\n```";
        return tournamentString;
    }
    
    static hasPermission(interaction, permission, user = null) {
        if (!interaction) return false;
        if (!interaction.guild) return true;
        if (!user) user = interaction.user;
        if (interaction.channel.permissionsFor(user).has(permission)) return true;
        return false;
    }
    
    static sanitizeUsername(username) {
        return username
            .replaceAll("_", "\\_")
            .replaceAll("*", "\\*")
            .replaceAll("|", "\\|")
            .replaceAll("`", "\\`")
    }
    
    static timeSecondsToTime(t) {
        return `${Math.floor(t / 60)}:${t % 60 < 10 ? "0" : ""}${t % 60}`;
    }
    
    static formatSeconds(seconds) {
        const years = Math.floor(seconds / (60 * 60 * 24 * 365));
        const days = Math.floor(seconds / (60 * 60 * 24)) - years * 365;
        const hours = Math.floor(seconds / (60 * 60)) - years * 365 * 24 - days * 24;
        const minutes = Math.floor(seconds / 60) - years * 365 * 24 * 60 - days * 24 * 60 - hours * 60;
        const remainingSeconds = seconds % 60;
        return `${years > 0 ? `${years}y ` : ""}${days > 0 ? `${days}d ` : ""}${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${remainingSeconds > 0 ? `${remainingSeconds}s` : ""}`;
    }
    
    static readJSON(path) {
        return JSON.parse(readFileSync(path));
    }
    
    static randomElements(array, amount) {
        const picked = [];
        while (picked.length < amount) {
            const pool = array.filter(element => !picked.includes(element));
            if (!pool.length)
                break;
            picked.push(pool[Math.floor(pool.length * Math.random())]);
        }
        for (let i = 0; i < picked.length; i += 1) {
            if (picked[i] instanceof Array) {
                picked[i] = picked[i][Math.floor(picked[i].length * Math.random())];
            }
        }
        return picked;
    }
}

export default Utils;