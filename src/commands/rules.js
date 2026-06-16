const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const RULES = {
  general: {
    title: '📜 General Rules',
    color: 0x5865F2,
    rules: [
      '**1.** Respect all members and staff — no harassment, hate speech, or discrimination',
      '**2.** No spam, flooding, or excessive caps',
      '**3.** Keep usernames and avatars appropriate (no offensive content)',
      '**4.** No impersonation of staff, bots, or other users',
      '**5.** Follow Discord Terms of Service at all times'
    ]
  },
  chat: {
    title: '💬 Chat Rules',
    color: 0x57F287,
    rules: [
      '**1.** Keep conversations in the correct channels',
      '**2.** No NSFW content outside of NSFW channels',
      '**3.** Use English in main channels (or your server language)',
      '**4.** No spoilers without using spoiler tags',
      '**5.** No excessive self-promotion or advertising'
    ]
  },
  voice: {
    title: '🔊 Voice Channel Rules',
    color: 0xFEE75C,
    rules: [
      '**1.** No soundboards, earrape, or microphone spam',
      '**2.** Respect others when speaking — no interrupting',
      '**3.** No recording conversations without permission',
      '**4.** Keep background noise to a minimum'
    ]
  },
  reporting: {
    title: '🚨 User Reporting',
    color: 0xEB459E,
    rules: [
      '**1.** Use `/report` or DM a moderator to report issues',
      '**2.** Provide screenshots and user IDs when reporting',
      '**3.** Do not false report — this is punishable',
      '**4.** Do not ping staff for minor issues, use tickets',
      '**5.** Harassment, raids, or NSFW should be reported immediately'
    ]
  },
  punishment: {
    title: '⚖️ Punishment System',
    color: 0xED4245,
    rules: [
      '**1st Offense** → Verbal Warning',
      '**2nd Offense** → 1 Hour Timeout',
      '**3rd Offense** → 24 Hour Timeout',
      '**4th Offense** → 7 Day Ban',
      '**5th Offense** → Permanent Ban',
      '',
      '*Staff reserve the right to skip steps for severe violations*'
    ]
  }
};

module.exports = {
  data: new SlashCommandBuilder()
   .setName('rules')
   .setDescription('Display server rules with categories'),

  RULES,

  async execute(interaction) {
    const selectMenu = new StringSelectMenuBuilder()
     .setCustomId('rules_select')
     .setPlaceholder('📖 Select a rule category')
     .addOptions(
        Object.entries(RULES).map(([key, value]) => ({
          label: value.title,
          value: key,
          description: `View ${value.title}`,
          emoji: value.title.split(' ')[0]
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
     .setTitle('📖 Windowra Server Rules')
     .setDescription('**Welcome to Windowra!**\n\nPlease select a category from the dropdown below to view our server rules.\n\nBy staying in this server, you agree to follow all rules.')
     .setImage(process.env.BANNER_URL)
     .setColor(0x2B2D31)
     .setFooter({
        text: 'Windowra Guard • Select a category above',
        iconURL: interaction.client.user.displayAvatarURL()
      })
     .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
