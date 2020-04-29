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

function getServerIconInEmoji(server) {
    return {
        'SciCraft': '<:scicraft:704084452346953780>',
        'ProtoTech': '<:prototech:704084450400534571>',
        'TIS Trinity Union': '<:tis:704084827611332659>',
        'Dugged': '<:dugged:704084451810082916>',
        'EndTech': '<:endtech:704092316201254944>',
        'Bismuth': '<:bismuth:704094568185856111>',
        'Hekate': '<:hekate:704094566810255441>',
        'Hypnos': '<:hypnos:704082841885212713>',
        'HammerSMP': '<:hammer:704082841943933030>',
        'Mechanists': '<:mechanists:704094568584577177>',
        'Ingenium': '<:ingenium:704096374869721179>',
        'FabulouslyEvil': '<:fabulously_evil:704096375079698472>',
        'BobbyCraft': '<:bobbycraft:704096373179547719>',
        'MelonTech': '<:melontech:704096373993242674>',
        'DarkTech': '<:darktech:704096374995812452>',
        'Pulse fiction': '<:pulse_fiction:704082842782662786>',
        'XMC': '<:xmc:704082843663597618>',
        'Sakura Logi': '<:sakura_logi:704113264975675402>',
        'Logic’s Geek Squad': '<:logics_geek_squad:704113265835376640>',
        "Tech MC Archive": "<:tech_mc_archive:704119428123721738>",
        "TMC": "<:tmc:704119430791168061>",
        "EigenCraft": "<:eigencraft:704119426617704528>",
        "Monkeys": "<:monkey:704119427196780674>",
        "JellySquid Discord": "<:jelly_squid:704119426580086856>",
        "Iron Lovers":  "<:iron_lovers:704119430418006178>",
        "Tree Huggers":  "<:tree_huggers:704119430690504719>",
        "Pingu People": "<:pingu_people:704119427183935488>",
        "The Fabric Project": "<:fabric:704120414418501743>",
        "Mojira": "<:mojira:704120414091083858>"
    }[server];
}