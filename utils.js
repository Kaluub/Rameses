import { readFileSync } from "fs";
import { TournamentPlayerRunData } from "./data.js";

function tournamentFormatter(tournament, full = false) {
    if(!tournament.leaderboard) {
        const fakeRun = new TournamentPlayerRunData();
        fakeRun.push({
            player:"Player" + " & Player".repeat(Math.max(tournament.teamSize - 1, 0)),
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

    for(const run of tournament.leaderboard){
        const lowerName = run.player.toLowerCase();
        if(!usersRuns[lowerName]){
            usersRuns[lowerName] = new TournamentPlayerRunData();
        }
        usersRuns[lowerName].list.push(run);
    }

    if(tournament.type == "sum"){
        sortedArray = Object.values(usersRuns).sort((e1,e2)=>TournamentPlayerRunData.sortElements(e1.total, e2.total));
    }else{//best
        sortedArray = Object.values(usersRuns).sort((e1,e2)=>TournamentPlayerRunData.sortElements(e1.best, e2.best));
    }

    for(const run of sortedArray) {
        position += 1;
        const runString = "\n\n"+run.getString(tournament, position);
        if((tournamentString + runString).length > 1997 && !full) break;
        tournamentString += runString;
    }
    tournamentString += "\n```";
    return tournamentString;
}

function hasPermission(interaction, permission, user = interaction.user) {
    if(!interaction) return false;
    if(!interaction.guild) return true;
    if(interaction.channel.permissionsFor(user).has(permission)) return true;
    return false;
}

function sanitizeUsername(username) {
    return username
        .replaceAll("_", "\\_")
        .replaceAll("*", "\\*")
        .replaceAll("|", "\\|")
        .replaceAll("`", "\\`")
}

function readJSON(path) {
    return JSON.parse(readFileSync(path))
}

export { tournamentFormatter, hasPermission, sanitizeUsername, readJSON }