//theo thứ tự : cho bot tham gia voice, enum các trạng thái
// kết nối (connected, disconnected), lấy kết nội hiện tại
// từ một guild
const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');

class VoiceManager {
    constructor() {
        // Dùng Map để lưu trữ trạng thái kết nối của từng Server (Guild) nếu bot ở nhiều server
        this.connections = new Map();
    }

    /**
     * Kết nối bot vào một kênh thoại
    @param {VoiceChannel} channel - Kênh thoại cần tham gia
     */
    // lấy id của server hiện tại từ kênh voice
    connect(channel) {
        const guildId = channel.guild.id;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            //cầu nối giữa discord.js và @discordjs/voice
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        });

        // Lưu kết nối vào Map để quản lý
        this.connections.set(guildId, connection);

        // Lắng nghe sự kiện mất kết nối (bị kick)
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log(`[Voice] Bot bị mất kết nối khỏi kênh: ${channel.name}. Đang thử kết nối lại...`);
            
            // Chờ 1 giây trước khi kết nối lại để tránh spam API
            //await -> dừng lại cho đến khi promise(tự resolve sau 1s)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Gọi lại chính hàm connect này để tự động join lại
            //recursive connect
            this.connect(channel);
        });

        return connection;
    }

    /**
     * Ngắt kết nối bot khỏi kênh thoại một cách chủ động
     * @param {string} guildId - ID của Server
     */
    disconnect(guildId) {
        const connection = getVoiceConnection(guildId);
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
            return true;
        }
        return false;
    }
}

module.exports = VoiceManager;