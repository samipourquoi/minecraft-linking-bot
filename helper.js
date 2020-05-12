// Exports

const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const Rcon = require('rcon');
const readLastLine = require('read-last-line');
const Query = require('minecraft-query');
const Jimp = require('jimp');

const config = require('./config.json');

module.exports = {
    Rcon,
    Discord,
    client,
    fs,
    Query,
    readLastLine,
    config,
    Jimp,
    sendLinks
}

////////////////////////////////////////////////

// Functions
function sendLinks(links, title) {
    let embed = new Discord.MessageEmbed()
        .setColor('#EBA620')
        .setTitle(title);

    let discordNames = Object.keys(links);

    for (let i = 0, link; i < discordNames.length; i++) {
        link = links[discordNames[i]];
        embed.addField(getServerIconInEmoji(discordNames[i]) + ' ' + discordNames[i] + ' ', link, true);
    }

    return embed;
}
