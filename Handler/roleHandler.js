const config = require('../config');
const { EmbedBuilder, userMention } = require('discord.js');

module.exports = async function roleHandler(member) {
    try {
        // Fetch member to ensure all properties are loaded
        // if (!member.user) {
        //     member = await member.guild.members.fetch(member.id);
        // }

        const roleId = member.user.bot ? config.role.bot : config.role.user;
        //roles.cache -> danh sách tất cả role trong server
        const role = member.guild.roles.cache.get(roleId);
        if (!role) return;

        const serverName = member.guild.name;
        const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${Number(member.guild.id) % 5}.png`;
        const serverAvatar = member.guild.iconURL({dynamic: true, size: 1024}) ?? defaultAvatar;
        const serverDescription = member.guild.description || "No description for this server";
        const serverMembersCount = member.guild.memberCount;
        const serverMembersOnlineCount = member.guild.members.cache.filter((m) => m.presence?.status !== 'offline').size;
        const serverCreateDate = member.guild.createdAt.toLocaleDateString('vi-VN', {day: '2-digit',month: '2-digit',year: 'numeric'});
        const welcomeChannel = '1430773621151891458';
        
        const newMember = member.user.username;
        const emp = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(':loudspeaker::tada: Everyone welcome our new member! :loudspeaker::tada: ' + newMember)
            .setAuthor({ name: serverName, iconURL: serverAvatar})
            .setDescription(serverDescription)
            .setThumbnail(serverAvatar)
            .addFields(
                { name: `Members:white_circle:: ${serverMembersCount}   Online:green_circle:: ${serverMembersOnlineCount}`, value: `Est: ${serverCreateDate}` },
                //{ name: '\u200B', value: '\u200B' },
                //{ name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .setImage('https://preview.redd.it/please-give-us-the-old-king-thumbs-up-sound-effect-the-new-v0-08kqgn4ad6511.png?auto=webp&s=e5d2593e728505a382222b58c209462d94faeb7f')
            .setTimestamp()
            .setFooter({ text: 'Thanks for joined our community!', iconURL: serverAvatar});
        
        console.log(`${newMember} vừa tham gia server!`);
        // const channel = await member.guild.channels.fetch('1430773621151891458');
        // if (channel) 
        await Promise.all([
            welcomeChannel.send({embeds: [emp]}),
            member.roles.add(role),
        ]);
        console.log(`Đã cấp role ${role.name} cho ${newMember}`);
    } 
    catch (error) {
        console.error('Không thể cấp role:', error);
    }
};