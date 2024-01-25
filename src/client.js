// @ts-check
import { Client, Partials } from "discord.js";
export const client = new Client({
	intents: [
		"Guilds",
		"GuildMembers",
		"GuildMessages",
		"MessageContent",
	],
	partials: [Partials.User, Partials.Channel, Partials.Message],
});
