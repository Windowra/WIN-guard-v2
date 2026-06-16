require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Collection();
const commands = [];

// Load commands
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is ONLINE`);
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log(`⚡ Registered ${commands.length} commands`);
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ There was an error', ephemeral: true }).catch(() => {});
    }
    return;
  }

  // BotGhost rules dropdown
  if (interaction.isStringSelectMenu() && interaction.customId === 'rules_select') {
    const rulesCommand = require('./commands/rules');
    const category = rulesCommand.RULES[interaction.values[0]];

    const embed = new EmbedBuilder()
     .setTitle(category.title)
     .setDescription(category.rules.join('\n\n'))
     .setColor(category.color)
     .setThumbnail(process.env.PUNISHMENT_URL)
     .setImage(process.env.BANNER_URL)
     .setFooter({
        text: `Windowra Guard • ${category.title}`,
        iconURL: interaction.client.user.displayAvatarURL()
      })
     .setTimestamp();

    await interaction.update({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
