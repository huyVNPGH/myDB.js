const {Player} = require('discord-player');
const VoiceManager = require('./VoiceManager');

class SpeakerPlayer extends VoiceManager{
    constructor() {
        super();
    }

    play(channel, query) {
        const {track} = await player.play(channel, query, {
            nodeOptions: {
                metadata: {channel : channel},
                leaveOnEmpty: false,
                leaveOnEnd: false,
                volume: 50
            }
        });
    }
}