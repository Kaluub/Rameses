import DiscordClient from "./classes/client.js";
import { AccountData } from "./classes/data.js";
const client = new DiscordClient();
await client.clientLogin();
if(process.argv.includes("-i")) await client.updateInteractions();
if(process.argv.includes("-v")) AccountData.loadTopVP();