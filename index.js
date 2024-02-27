const Discord = require('discord.js'); 
const fs = require("fs");
const client = new Discord.Client();
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');

let sentAccounts = [];
const channelID = "1211981542893555762"; 

client.on("message", async message => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "!ücretsiz" && message.channel.id === channelID) {
    fs.readFile("service/hesap.txt", "utf8", (err, data) => {
      if (err) {
        console.error("Dosya okunurken bir hata oluştu:", err);
        return;
      }

      let accounts = data.trim().split(/\r?\n/);
      let availableAccounts = accounts.filter(account => !sentAccounts.includes(account)); 
      if (availableAccounts.length === 0) {
        const embed = new MessageEmbed()
          .setTitle("Ücretsiz Hesaplar")
          .setDescription("Ücretsiz hesap bulunamadı.")
          .setColor("#ff0000");
        message.author.send(embed);
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableAccounts.length);
      const randomAccount = availableAccounts[randomIndex];
      const [username, password] = randomAccount.split(":");

      const randomColors = [
        "#ff0000", 
        "#00ff00", 
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff", 
      ];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];

      const embed = new MessageEmbed()
        .setTitle("Ücretsiz Hesaplar")
        .setDescription(`**Username:** ***${username}***\n**Password:** ***${password}***`)
        .setColor(randomColor)
        .setImage("https://media.discordapp.net/attachments/1190665513035112483/1212082001784348723/standard_7.gif?ex=65f08a54&is=65de1554&hm=4ad8384531b033ac9e410d8dcc36549d22328222c51a2ef4a2834b4e58d7b23e&=&width=374&height=48");

      message.author.send(embed)
        .then(() => {
          sentAccounts.push(randomAccount); 
          message.channel.send("**Hesap DM'den Başarıyla İletildi! <a:done:1209180333291995166> **");

          accounts = accounts.filter(account => account !== randomAccount);
          fs.writeFile("service/hesap.txt", accounts.join("\n"), (err) => {
            if (err) console.error("Hesap dosyası güncellenirken bir hata oluştu:", err);
          });
        })
        .catch(error => {
          console.error(`Ücretsiz bilgileri gönderirken bir hata oluştu: ${error}`);
          const errorEmbed = new MessageEmbed()
            .setTitle("Hata")
            .setDescription("Ücretsiz bilgilerinizi gönderirken bir hata oluştu. Lütfen tekrar deneyin.")
            .setColor("#ff0000");
          message.channel.send(errorEmbed);
        });
    });
  }
});

client.on("message", async message => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "!hesapsayısı") {
    fs.readFile("hesap.txt", "utf8", (err, data) => {
      if (err) {
        console.error("Dosya okunurken bir hata oluştu:", err);
        return;
      }

      const accounts = data.trim().split(/\r?\n/);
      const accountCount = accounts.length;

      message.channel.send(`Toplamda ${accountCount} hesap var.`);
    });
  }
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    status: "online",
    activity: { name: "JettChecker", type: "WATCHING" },
  });
});

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  const guild = newPresence.guild;

  if (!oldPresence || !newPresence) return;

  const roleId = config.roleId;
  const message = config.message;
  const logsChannelId = config.logs;

  const role = guild.roles.cache.get(roleId);
  const logsChannel = client.channels.cache.get(logsChannelId);

  if (!role || role.deleted || !logsChannel) return;

  const member = guild.members.cache.get(newPresence.userID);
  if (!member) return;

  const statuses = newPresence.activities.map(activity => activity.state);
  for (const status of statuses) {
    if (status && status.includes(message)) {
      member.roles.add(role, 'JettChecker');
      const embed = new Discord.MessageEmbed()
        .setTitle(`Url Aldı`)
        .setColor(`#2F3136`)
        .setFooter(`JettChecker`)
        .setDescription(`\`${member.user.tag}\` Url aldı, aileye hoşgeldin. \`${role.name}\``);
      logsChannel.send(embed);
      return; 
    }
  }

  if (member.roles.cache.has(roleId)) {
    const embed = new Discord.MessageEmbed()
      .setTitle(`Url kaldırdı`)
      .setColor(`#2F3136`)
      .setFooter(`JettChecker`)
      .setDescription(`\`${role.name}\` Rolü kaldırıldı \`${member.user.tag}\``);
    logsChannel.send(embed);
    member.roles.remove(role, 'JettChecker');
  }
});



const boosterRoleID = "1206311655739359272"; // Booster rolünün ID'si
const serviceFiles = {
    "steam": "steam.txt",
    "disney": "disney.txt",
    "blutv": "blutv.txt",
    "netflix": "netflix.txt",
    "valorant": "hesap.txt",
    "roblox": "roblox.txt"
};
const allowedChannelID = "1212098290301149184"; // İzin verilen kanalın ID'si

client.on("message", async message => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Komutun sadece belirli kanalda kullanılabilir olması için kontrol
    if (message.channel.id !== allowedChannelID) {
        message.channel.send("**Bu Komutu Kullana Bilmek İçin Sunucuya Boost Bas <a:premium:1203769571098624110> **");
        return;
    }

    if (command === "!boost") {
        if (!message.member.roles.cache.has(boosterRoleID)) {
            message.channel.send("Bu komutu kullanabilmek için booster rolüne sahip olmanız gerekiyor.");
            return;
        }

        const selectedService = args[0];
        const serviceFile = serviceFiles[selectedService];

        if (!serviceFile) {
            message.channel.send("**Geçersiz Hizmet Seçimi. Lütfen Bir Hizmet Seçin: *__Steam__*, *__Disney__*, *__Blutv__*, *__Netflix__*, *__Valorant__*, *__Roblox__**");
            return;
        }

        fs.readFile(serviceFile, "utf8", (err, data) => {
            if (err) {
                console.error("Dosya okunurken bir hata oluştu:", err);
                message.channel.send("Hizmet dosyası okunurken bir hata oluştu.");
                return;
            }

            let accounts = data.trim().split(/\r?\n/);
            if (accounts.length === 0) {
                message.channel.send("Üzgünüm, bu hizmet için hesap bulunamadı.");
                return;
            }

            const randomIndex = Math.floor(Math.random() * accounts.length);
            const randomAccount = accounts[randomIndex];
            const [username, password] = randomAccount.split(":");

            const embed = new Discord.MessageEmbed()
                .setTitle(`Boost ${selectedService.charAt(0).toUpperCase() + selectedService.slice(1)} Hesabınız`)
                .setColor("#0099ff")
                .setDescription(`**Kullanıcı Adı:** ***${username}***\n**Şifre:** ***${password}***`)
                .setImage("https://media.discordapp.net/attachments/1190665513035112483/1212082001784348723/standard_7.gif?ex=65f08a54&is=65de1554&hm=4ad8384531b033ac9e410d8dcc36549d22328222c51a2ef4a2834b4e58d7b23e&=&width=374&height=48");

            message.author.send(embed)
                .then(() => {
                    message.channel.send(`***${selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}*** **Hesap DM'den Başarıyla İletildi! <a:e_:1210233538637463613> **`);

                    accounts = accounts.filter(account => account !== randomAccount);
                    fs.writeFile(serviceFile, accounts.join("\n"), (err) => {
                        if (err) console.error("Hesap dosyası güncellenirken bir hata oluştu:", err);
                    });
                })
                .catch(error => {
                    console.error(`Hesap bilgileri gönderilirken bir hata oluştu: ${error}`);
                    message.channel.send(`Hesap bilgileri gönderilirken bir hata oluştu. Lütfen tekrar deneyin.`);
                });
        });
    }
});

client.on("message", async message => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "!stokboost") {
    let stockInfo = "\n";

    for (const [service, file] of Object.entries(serviceFiles)) {
      try {
        const data = fs.readFileSync(file, 'utf8');
        const accounts = data.trim().split(/\r?\n/);
        stockInfo += `**${service.charAt(0).toUpperCase() + service.slice(1)} - ** ***__${accounts.length}__*** **Hesap**\n`;
      } catch (err) {
        stockInfo += `**${service.charAt(0).toUpperCase() + service.slice(1)} - ** Hata: Dosya okunamadı\n`;
      }
    }

    const embed = new Discord.MessageEmbed()
      .setTitle("Stok Durumu")
      .setDescription(stockInfo)
      .setColor("#0E99f5");

    message.channel.send(embed);
  }
});

client.on("message", async message => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "!stokfree") {
    try {
      const file = serviceFiles["valorant"];
      const data = fs.readFileSync(file, 'utf8');
      const accounts = data.trim().split(/\r?\n/);
      const embed = new Discord.MessageEmbed()
        .setTitle("Valorant Stok Durumu")
        .setDescription(`Valorant - **${accounts.length}** Hesap`)
        .setColor("#0E99f5");
      message.channel.send(embed);
    } catch (err) {
      console.error("Valorant stok durumu alınırken bir hata oluştu:", err);
      message.channel.send("Valorant stok durumu alınırken bir hata oluştu.");
    }
  }
});

client.login(config.TOKEN);