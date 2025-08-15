import Utils from "./utils.js";

const data = Utils.readJSON("data/evades.json");
data.staff = Array.of(...data.developers, ...data.headMods, ...data.seniorMods, ...data.mods, ...data.juniorMods);

export default data;