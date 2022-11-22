function tournamentSorter(run1, run2) {
    if(parseInt(run1.area.split(" ")[1]) > parseInt(run2.area.split(" ")[1])) return -1;
    else if(run1.area == run2.area) {
        if(run1.timeSeconds > run2.timeSeconds) return 1;
        else return -1;
    }
    else return 1;
}

function tournamentFormatter(tournament) {
    if(!tournament.leaderboard) {
        return "```asciidoc\n= Leaderboard =\n" + tournament.format.toLowerCase()
            .replaceAll("{position}", "1")
            .replaceAll("{player}", "Player" + " & Player".repeat(Math.max(tournament.teamSize - 1, 0)))
            .replaceAll("{area}", "Area")
            .replaceAll("{time}", "Time")
            .replaceAll("{attempt}", `(0/${tournament.attempts})`)
        + "\n```";
    }
    let tournamentString = "```asciidoc\n= Leaderboard =\n";
    let position = 0;
    const usersAdded = [];
    for(const run of tournament.leaderboard.sort(tournamentSorter)) {
        if(usersAdded.includes(run.player.toLowerCase())) continue;
        position += 1;
        if(position > 15) continue;
        tournamentString += tournament.format.toLowerCase()
            .replaceAll("{position}", position.toString())
            .replaceAll("{player}", run.player)
            .replaceAll("{area}", run.area)
            .replaceAll("{time}", run.time)
            .replaceAll("{attempt}", `(${tournament.leaderboard.filter(r => run.player.toLowerCase() == r.player.toLowerCase()).length}/${tournament.maxAttempts})`)
            + "\n\n"
        usersAdded.push(run.player.toLowerCase());
    }
    tournamentString += "```"
    return tournamentString;
}

export { tournamentSorter, tournamentFormatter }