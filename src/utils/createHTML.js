// @ts-check
/**
 * @param {import("discord.js").Interaction} interaction
 * @param {string} code
 */
export default function createHTML(interaction, code) {
	return `<!DOCTYPE html>
  <html lang="tr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Doğrulama Kodu</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              margin: 0;
              height: 100vh;
          }
          .container {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              flex-direction: row; /* Yatay sıralama */
          }
          h2 {
              color: #5865F2;
              margin-right: 20px; /* Başlık ile arasına boşluk ekleyebilirsiniz */
          }
          h3 {
              font-size: 18px;
              margin-bottom: 10px;
          }
          p {
              font-size: 16px;
              margin-bottom: 16px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h2>${interaction.guild?.name}</h2>
          <h3>Merhaba ${interaction.user.displayName},</h3>
          <p>Discord sunucumuza hoş geldiniz! Sizi aramızda görmekten heyecan duyuyoruz.<br> Sunucuya giriş yapmak için lütfen aşağıdaki doğrulama kodunu kullanın:
  <br>
  <br>
  Doğrulama Kodu: <b> ${code} </b>
  <br><br>
  Sunucuya giriş yapmak için lütfen bu kodu bot üzerinde ki doğrulama bölümüne girin. <br>Eğer zaten sunucuya giriş yaptıysanız bu e-postayı göz ardı edebilirsiniz.
  <br><br>
  Sunucumuzda bulunduğunuz için teşekkür ederiz!
  </p>
  <h3> 
  Saygılarımla,
  ${interaction.guild?.name}
  </h3>
      </div>
  </body>
  </html>`;
}
