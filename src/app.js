import DiscordClient from "./classes/client.js";
import { AccountData, closeDatabase } from "./classes/data.js";

const client = new DiscordClient();
await client.clientLogin();

if (process.argv.includes("-i")) await client.updateInteractions();
if (process.argv.includes("-v")) AccountData.loadTopVP();

async function shutdown(reason) {
	console.log(`Shutting down: ${reason}`);
	try {
		await client.destroy();
		console.log("Discord client destroyed.");
	} catch (err) {
		console.error("Error destroying Discord client:", err);
	}

	try {
		await closeDatabase();
	} catch (err) {
		console.error(err);
	}

	process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
	console.error("Uncaught exception:", err);
	shutdown("uncaughtException");
});