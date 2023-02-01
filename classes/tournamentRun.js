import { timeSecondsToTime } from "../utils.js";

class TournamentPlayerRunData {
    constructor() {
        this.list = [];
    }

    getString(tournament, position) {
        let res = "", total = this.total, best = this.best;

        if (tournament.type == "best") total = best;

        res += tournament.topFormat.replaceAll("{position}", position.toString())
            .replaceAll("{player}", best.player)
            .replaceAll("{area}", total.area)
            .replaceAll("{time}", timeSecondsToTime(total.timeSeconds))
            .replaceAll("{attempt}", `(${this.list.length}/${tournament.maxAttempts})`);

        if (tournament.bottomFormat != " ") for (let i = 0; i < this.list.length; i++) {
            const run = this.list[i];

            res += "\n" + tournament.bottomFormat
                .replaceAll("{player}", run.player)
                .replaceAll("{area}", run.area)
                .replaceAll("{time}", run.time)
                .replaceAll("{attempt}", `(${i + 1}/${tournament.maxAttempts})`);
        }


        return res;
    }

    get total() {
        const res = {
            area: 0,
            timeSeconds: 0
        };
        for (const run of this.list) {
            if (!isNaN(+run.area.split(" ")[1])) res.area += +run.area.split(" ")[1];
            res.timeSeconds += run.timeSeconds;
        }

        res.area = "Area " + res.area;

        return res;
    }

    get best() {
        return [...this.list].sort(TournamentPlayerRunData.sortElements)[0];
    }

    static sortElements(run1, run2) {
        let area1 = run1.area == "Victory!" ? Infinity : +run1.area.split(" ")[1];
        let area2 = run2.area == "Victory!" ? Infinity : +run2.area.split(" ")[1];

        return area2 - area1 || run1.timeSeconds - run2.timeSeconds;
    }
}

export default TournamentPlayerRunData;