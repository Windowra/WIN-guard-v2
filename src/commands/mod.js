const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
   .setName('mod')
   .setDescription('Professional moderation tools')
   .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
   .addSubcommand(subcommand =>
      subcommand
       .setName('purge')
       .setDescription('Delete multiple messages at once')
       .addIntegerOption(option =>
          option.setName('amount')
           .setDescription('Number of messages to delete (1-100)')
           .setRequired(true)
           .setMinValue(1)
           .setMaxValue(100)))
   .addSubcommand(subcommand =>
      subcommand
       .setName('timeout')
       .setDescription('Timeout a member')
       .addUserOption(option =>
          option.setName('user')
           .setDescription('User to timeout')
           .setRequired(true))
       .addIntegerOption(option =>
          option.setName('minutes')
           .setDescription('Duration in minutes')
           .setRequired(true)
           .setMinValue(1)
           .setMaxValue(40320))
       .addStringOption(option =>
          option.setName('reason')
           .setDescription('Reason for timeout')
           .setRequired(false)))
   .addSubcommand(subcommand =>
      subcommand
       .setName('ban')
       .setDescription('Ban a member from the server')
       .addUserOption(option =>
          option.setName('user')
           .setDescription('User to ban')
           .setRequired(true))
       .addStringOption(option =>
          option.setName('reason')
           .setDescription('Reason for ban')
           .setRequired(false))
       .addBooleanOption(option =>
          option.setName('delete_messages')
           .setDescription('Delete user messages from last 7 days')
           .setRequired(false))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'purge') {
      const amount = interaction.options.getInteger('amount');
      await interaction.deferReply({ ephemeral: true });

      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply({
        content: `✅ Successfully purged ${deleted.size} messages`
      });
      return;
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const member = await interaction.guild.members.fetch(targetUser.id);

      const embed = new EmbedBuilder()
       .setTitle(`Moderation Action: ${subcommand.toUpperCase()}`)
       .setColor(subcommand === 'ban'? 0xED4245 : 0xFEE75C)
       .setThumbnail(process.env.PUNISHMENT_URL || targetUser.displayAvatarURL())
       .addFields(
          { name: '👤 User', value: `${targetUser.tag}\n(${targetUser.id})`, inline: true },
          { name: '👮 Moderator', value: interaction.user.tag, inline: true },
          { name: '📝 Reason', value: reason, inline: false }
        )
       .setFooter({ text: 'Windowra Guard • Professional Moderation' })
       .setTimestamp();

      if (subcommand === 'timeout') {
        const minutes = interaction.options.getInteger('minutes');
        await member.timeout(minutes * 60 * 1000, reason);
        embed.setDescription(`⏱️ **${targetUser.tag}** has been timed out for **${minutes} minutes**`);
      }
      else if (subcommand === 'ban') {
        const deleteMessages = interaction.options.getBoolean('delete_messages') || false;
        await member.ban({
          reason,
          deleteMessageSeconds: deleteMessages? 604800 : 0
        });
        embed.setDescription(`🔨 **${targetUser.tag}** has been permanently banned`);
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      await interaction.reply({
        content: `❌ Failed to ${subcommand} user: ${error.message}`,
        ephemeral: true
      });
    }
  }
};
