// @ts-check
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	EmbedBuilder,
} from "discord.js";
import { Event } from "djs-bot-base";
import { console } from "sneaks";
import config from "../config.js";
import db from "../db.js";

export default new Event({
	categoryName: "ready",
	async run(bot) {
		db.set("users", {});
		console.success(`${bot.user.username} Discord'a giriş yaptı.`);

		setInterval(() => {
			/** @type {{ user: string; date: string; code: string; }[]} */
			const users = db.get("users");
			const array = Object.values(users);

			for (const user of array) {
				const time = 300000 - (Date.now() - Number(user.date));
				if (time > 0) return;

				db.delete(`users.${user.code}`);
			}
		}, 1000);

		const channel = await bot.channels
			.fetch(config.channelId)
			.catch(() => undefined);
		if (!channel || (channel && channel.type !== ChannelType.GuildText)) return;

		/** @type {string | null} */
		const messageId = db.get("messageId", null);
		if (!messageId) {
			/** @type {ActionRowBuilder<ButtonBuilder>} */
			const actionRow = new ActionRowBuilder();
			actionRow.setComponents(
				new ButtonBuilder()
					.setCustomId("register")
					.setLabel("Kod al")
					.setEmoji("⬆️")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("login")
					.setLabel("Giriş yap")
					.setEmoji("➡️")
					.setStyle(ButtonStyle.Secondary),
			);

			const finalEmbed = new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle("Hop, dur dedik!")
				.setDescription(
					"Bu sunucuya erişim sağlamak için lütfen aşağıdaki Kod Al butonuna tıklayarak size özel bir kod alın. Ardından, elde ettiğiniz kodu kullanarak aşağıdaki Giriş Yap butonuna tıklayarak sunucuya giriş yapabilirsiniz. Unutmayın, her kullanıcı için benzersiz bir kod oluşturulacaktır.",
				)
				.setFields({
					name: "Güvenilirlik",
					value:
      "Endişe etmeyin, gönderdiğiniz e-postaların hiçbiri veri tabanlarında kaydedilmiyor. Gizliliğiniz bizim için son derece önemlidir. Sistemimize giriş yaptığınızda sağladığınız bilgiler sadece geçici olarak işlenir ve herhangi bir kişisel veri kalıcı olarak kaydedilmez. Güvenliğiniz ve gizliliğiniz bizim önceliğimizdir.",
				})
				.setFooter({
					text: `Kendilerini doğrulayan ${0} kullanıcı bulunuyor.`,
					iconURL: bot.user.displayAvatarURL(),
				})
				.setTimestamp();

			const message = await channel.send({
				embeds: [finalEmbed],
				components: [actionRow],
			});

			db.set("messageId", message.id);
			return;
		}
	},
});
