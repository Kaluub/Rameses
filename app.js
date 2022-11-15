import DiscordClient from "./client.js";
const client = new DiscordClient();
await client.clientLogin();
if(process.argv.includes("-i")) await client.updateInteractions();