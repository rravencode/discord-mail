// @ts-check
import { EventHandler } from "djs-bot-base";
import { client } from "./client.js";
import config from "./config.js";

const events = new EventHandler({
	eventsDir: "./src/events",
	suppressWarnings: true,
});

(async () => {
	await events.setEvents(client);
	await client.login(config.token);
})();
