/*
Developped by samipourquoi
Some ideas come from Daniel (from the Hypnos server)
Bot made for the Minecraft technical server named EndTech: https://discord.gg/t7UwaDc
*/

const helper = require('./helper.js')
const Discord = helper.Discord;
const client = helper.client;
const fs = helper.fs;
const miteru = require('miteru');
const Rcon = helper.Rcon;
const config = helper.config;
const readLastLine = helper.readLastLine;
const Query = helper.Query;

const scoreboard = require('./scoreboard.js');

exports = {RCONs};

var Queries = {};
var RCONs = {};
var minecraftToDiscordLinkings = {};
var serverNames = Object.keys(config.servers);
var serverChannels = [];

// Initiates every server with the RCONs and the minecraft-discord linking(s)
function setup() {
    for (let i = 0, server; i < serverNames.length; i++) {
        server = config.servers[serverNames[i]];

        // Creates an object of all the RCONs (discord-minecraft)
        RCONs[serverNames[i]] = new Rcon(server.ip, server.rconPort, server.rconPassword, {tcp: true, challenge: undefined});
        RCONs[serverNames[i]].connect()
        
        // Connects to every server RCON
        RCONs[serverNames[i]].on('auth', () => {
            console.log(serverNames[i] + ' RCON is running!');
        });

        serverChannels.push(server.bridgeChannelID);

        // Initiates the minecraft-discord linking(s)
        minecraftToDiscordLinkings[serverNames[i]] = miteru.watch( function ( evt, file ) {
            switch (evt) {
                case 'init':
                    console.log(`Reading ${serverNames[i]} log file`);
                    break;

                /*
                The server often deletes the log file and recreates a new one to reset it.
                What's more, fs library doesn't handle file deletion.
                Thus, we must use an other file watcher, named miteru
                */

                case 'unlink':
                    // When file is deleted
                    console.log(`${serverNames[i]} log file is reseting`);
                    break;

                case 'add':
                    // When file is recreated
                    console.log(`${serverNames[i]} log file is reseted`);
                    break;
        
                case 'change':
                    // When a message is sent in minecraft (=when a new line appears in the log file)
                    readLastLine.read(file, 1, 'utf16').then(line => {
                        line = line.substring(33, line.length - 1); // Removes the \n at the end of the line
                        /*
                        Logs are structured like this:
                        [hh:mm:ss] [Server thread/INFO]: <samipourquoi> Hello world!\n
                                                         ^33rd index                ^line.length - 1
                        */

                       if (
                        !line.includes('Can\'t keep up!') &&
                        !line.includes('Rcon connection from') &&
                        !line.includes('UUID of player') &&
                        !line.includes('logged in with entity id') &&
                        !line.includes('[Rcon:') &&
                        !line.includes('Mismatch') &&
                        !line.includes('Fetching packet') &&
                        !line.includes('com.mojang.authlib') // It says the ip adress…
                        /*
                        All of these are for only letting through the messages and not the "private" informations
                        */

                        ) {

                            scoreboardCommand = line.substring(line.indexOf('>') + 2, line.indexOf('>') + 13);
                            scoreboardName = line.substring(line.indexOf('>') + 14)

                            /*
                            line: <samipourquoi> !scoreboard ts_Deaths
                            line.indexOf('>') + 2^         ^line.indexOf('>') + 13
                            */

                            if (line.charAt(0) == '[') { // A way to check if it's a command or a message
                                client.channels.fetch(server.bridgeChannelID).then(channel => {
                                    try {
                                        channel.send('*' + line + '*');
                                    } catch {}
                                });
                            } else {
                                client.channels.fetch(server.bridgeChannelID).then(channel => {
                                    try {
                                        channel.send(line);
                                    } catch {}
                                });
                            }

                            if (scoreboardCommand == '!scoreboard') {
                                if (scoreboardName == 'clear') RCONs[serverNames[i]].send('/scoreboard objectives setdisplay sidebar');
                                else RCONs[serverNames[i]].send('/scoreboard objectives setdisplay sidebar ' + scoreboardName);
                            }
                        }
                    });
                    break;
            }
        });
        
        minecraftToDiscordLinkings[serverNames[i]].add(server.logFile);

        // Initiates server queries
        Queries[serverNames[i]] = new Query({
            ip: server.ip,
            port: server.queryPort,
            timeout: 7500
        });
    }
}

client.on('message', message => {
    if (!message.author.bot & message.content.substring(0, config.prefix.length) == config.prefix) { // If not a bot (to prevent infinite loops) and if there is the prefix
        var command = message.content.substring(config.prefix.length).split(' ');
        
        switch (command[0]) {
            case 'execute':

                /*
                Loops through the servers config to get the right RCON (from the object RCONs), to which send the command.
                */

                let goodRCON;

                for (let i = 0; i < serverChannels.length; i++) {
                    if (config.servers[serverNames[i]].bridgeChannelID == message.channel.id) goodRCON = RCONs[serverNames[i]];
                }

                if (!config.serverOPs.includes(message.author.id)) {
                    let embed = new Discord.MessageEmbed()
                        .setColor('#E45132')
                        .setTitle('You must be a server op to do that! ')
                        .setAuthor(message.author.username, message.author.displayAvatarURL());

                    message.channel.send(embed)
                } else if (!serverChannels.includes(message.channel.id)) {
                    let embed = new Discord.MessageEmbed()
                        .setColor('#E45132')
                        .setTitle('You must use this command in a bridge channel!')
                        .setAuthor(message.author.username, message.author.displayAvatarURL());

                    message.channel.send(embed)
                } else if (serverChannels.includes(message.channel.id)) {
                    var argument = command.slice(1).join(' ');
                    if (argument.charAt(0) != '/') argument = '/' + argument // Adds the / if not in the command input by the user

                    goodRCON.send(argument) // Sends the command to the right server

                    goodRCON.once('response', answer => { // Listens for an answer
                        if (
                            answer.includes('Invalid') ||
                            answer.includes('Unknown') ||
                            answer.includes('Expected') ||
                            answer.includes('Unexpected') ||
                            answer.includes('Error') ||
                            answer.includes('player')
                            // Lists all the possible keywords for an error (almost…)
                        ) {
                            var embed = new Discord.MessageEmbed()
                                .setColor('#E45132')
                                .setAuthor(message.author.username, message.author.displayAvatarURL())
                                .setTitle(answer.substring(0, answer.indexOf('/')).substring(0, 255)) // Overflow protection
                                .setDescription(answer.substring(answer.indexOf('/'), 2047)) // Overflow protection
                            
                                /*
                                Answer is structured like this: (example)
                                Unknown item 'minecraft:grasss'/give @a minecraft:grasss<--[HERE]
                                            answer.indexOf('/')^
                                */

                            message.channel.send(embed)
                        } else {
                            var embed = new Discord.MessageEmbed()
                                .setColor('#6FC43F')
                                .setAuthor(message.author.username, message.author.displayAvatarURL())
                                .setTitle(answer.substring(0, 255)) // Overflow protection

                            message.channel.send(embed)
                        }
                    });
                }

                break;

            case 'online':
                var embed = new Discord.MessageEmbed()
                        .setColor('#6FC43F')
                        .setTitle('Online players')
                        .setAuthor(message.guild.name, message.guild.iconURL())

                var promises = [];

                for (let i = 0; i < serverNames.length; i++) {
                    promises.push(Queries[serverNames[i]].fullStat().then(stats => {
                        if (stats.players.length == 0) stats.players = 'There is nobody online!'
                        embed.addField(`${serverNames[i]} ${stats.online_players}/${stats.max_players}`, stats.players, false);
                    }));
                }

                Promise.all(promises).then(() => message.channel.send(embed));

                break;

            case 'scoreboard':

                if (command[1] != undefined) {

                    let goodRCON = RCONs[config.toWhatServerGetScoreboard];

                    if (serverChannels.includes(message.channel.id)) for (let i = 0; i < serverChannels.length; i++) {
                        if (config.servers[serverNames[i]].bridgeChannelID == message.channel.id) goodRCON = RCONs[serverNames[i]];
                    }

                    scoreboard.sendScoreboard(goodRCON, command[1], message.channel);

                } else {
                    message.channel.send(
                        new Discord.MessageEmbed()
                            .setColor('#E45132')
                            .setAuthor(message.guild.name, message.guild.iconURL())
                            .setTitle('You must specify a scoreboard name!')
                    )
                }

                break;
        }
    } else if (!message.author.bot && serverChannels.includes(message.channel.id)) {

        /*
        Loops through the servers config to get the right RCON (from the object RCONs), to which send the command.
        */

        let goodRCON;

        for (let i = 0; i < serverChannels.length; i++) {
            if (config.servers[serverNames[i]].bridgeChannelID == message.channel.id) goodRCON = RCONs[serverNames[i]];
        }

        goodRCON.send(`/tellraw @a "[${message.author.username}] ${message.content}"`);

    }
});

client.once('ready', () => {
    console.log('\nConnected!\n');
    setup();
});

client.login(helper.config.token);
