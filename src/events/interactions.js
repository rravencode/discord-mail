// @ts-check
import {
	ActionRowBuilder,
	EmbedBuilder,
	GuildMember,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { Event } from "djs-bot-base";
import nodemailer from "nodemailer";
import { randomInt } from "utilscord";
import config from "../config.js";
import db from "../db.js";
import createHTML from "../utils/createHTML.js";

export default new Event({
	categoryName: "interactionCreate",
	async run(interaction) {
		if (interaction.isButton()) {
			const customId = interaction.customId;
			if (customId.startsWith("register")) {
				const modal = new ModalBuilder()
					.setCustomId("register")
					.setTitle(interaction.client.user.username);

				const emailAdress = new TextInputBuilder()
					.setCustomId("emailAdress")
					.setLabel("E-posta adresinizi aşağıda yazınız:")
					.setPlaceholder("romanbabababa@hotmail.com")
					.setStyle(TextInputStyle.Short);

				/** @type {ActionRowBuilder<TextInputBuilder>} */
				const firstActionRow = new ActionRowBuilder();
				firstActionRow.addComponents(emailAdress);
				modal.addComponents(firstActionRow);
				await interaction.showModal(modal);
			}

			if (customId.startsWith("login")) {
				const modal = new ModalBuilder()
					.setCustomId("login")
					.setTitle(interaction.client.user.username);

				const code = new TextInputBuilder()
					.setCustomId("code")
					.setLabel("Aldığınız kodu giriniz:")
					.setPlaceholder("4578")
					.setStyle(TextInputStyle.Short);

				/** @type {ActionRowBuilder<TextInputBuilder>} */
				const firstActionRow = new ActionRowBuilder();
				firstActionRow.addComponents(code);
				modal.addComponents(firstActionRow);
				await interaction.showModal(modal);
			}
		}

		if (interaction.isModalSubmit()) {
			const customId = interaction.customId;
			if (customId.startsWith("register")) {
				const emailAdress = interaction.fields.getTextInputValue("emailAdress");
				const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

				if (!emailRegex.test(emailAdress)) {
					await interaction.reply({
						content:
       "❌ Girdiğiniz e-posta adresi **geçersiz**, lütfen tekrar deneyin.",
						ephemeral: true,
					});
					return;
				}

				const createCode = () => {
					const code = `${randomInt(1000, 9999)}`;
					if (db.has(code)) {
						return createCode();
					}

					return code;
				};

				const code = createCode();
				const html = createHTML(interaction, code.toString());

				const transport = nodemailer.createTransport({
					service: "hotmail",
					auth: {
						user: config.mail.username,
						pass: config.mail.password,
					},
				});
				const mail = await transport
					.sendMail({
						from: config.mail.username,
						to: emailAdress,
						subject: "Doğrulama kodu",
						html,
					})
					.catch(() => undefined);
				if (!mail) {
					await interaction.reply({
						content:
       "❌ Bir sorunla karşılaşıldı, ancak çözüm için çalışıyoruz. Lütfen **biraz bekleyin** ve tekrar deneyin. ",
						ephemeral: true,
					});
					return;
				}

				db.set(`users.${code}`, {
					user: interaction.user.id,
					date: Date.now(),
					code,
				});
				await interaction.reply({
					content: `✅ Onay kodunuz **${emailAdress}** adresine gönderildi. Lütfen 3-5 dakika bekleyin. Eğer e-posta almadıysanız, spam klasörünü kontrol etmeyi unutmayın.`,
					ephemeral: true,
				});
			}

			if (customId.startsWith("login")) {
				const code = interaction.fields.getTextInputValue("code");
				/** @type {{ user: string; date: number; } | null} */
				const codeData = db.get(`users.${code}`, null);
				if (!codeData) {
					await interaction.reply({
						content:
       "❌ Üzgünüz, girdiğiniz kod **geçerli değil**. Lütfen doğru bir kod girdiğinizden emin olun. ",
						ephemeral: true,
					});
					return;
				}

				const { user } = codeData;
				if (user !== interaction.user.id) {
					await interaction.reply({
						content:
       "❌ Üzgünüz, girdiğiniz kod, **başka** bir kullanıcıya ait gibi görünüyor.",
						ephemeral: true,
					});
					return;
				}

				const member = interaction.member;
				if (!(member && member instanceof GuildMember)) return;

				if (config.oldRole.length) member.roles.remove(config.oldRole);
				if (config.newRole.length) member.roles.add(config.newRole);

				db.delete(`users.${code}`);
				db.add("thoseWhoEnteredTheCode", 1);

				/** @type {number} */
				const thoseWhoEnteredTheCode = db.get("thoseWhoEnteredTheCode", 0);
				const embed = interaction.message?.embeds[0];
				if (!embed) return;

				const embedBuilder = EmbedBuilder.from(embed.data).setFooter({
					text: `Kendilerini doğrulayan ${thoseWhoEnteredTheCode} kullanıcı bulunuyor.`,
					iconURL: interaction.client.user.displayAvatarURL(),
				});

				await interaction.message?.edit({ embeds: [embedBuilder] });
				await interaction.reply({
					content:
      "✅ **Tebrikler!** Sunucuya başarıyla giriş yaptınız, artık konuşabilirsiniz! İyi sohbetler dileriz. ",
					ephemeral: true,
				});
			}
		}
	},
});
