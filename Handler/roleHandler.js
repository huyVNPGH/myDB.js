const config = require('../config');

module.exports = async function roleManager(member) {
    console.log(`${member.user.tag} vừa tham gia server!`);

    const roleId = member.user.bot ? config.roles.bot : config.roles.user;
    const role = member.guild.roles.cache.get(roleId);
    if (!role) return;

    try {
        await member.roles.add(role);
        console.log(`Đã cấp role ${role.name} cho ${member.user.tag}`);
    } catch (error) {
        console.error('Không thể cấp role:', error);
    }
};