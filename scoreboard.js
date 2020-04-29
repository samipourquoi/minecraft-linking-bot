const helper = require('./helper.js');
const Jimp = require('jimp');
const Rcon = require('rcon');
const fs = helper.fs;
const path = require('path');

module.exports = {
    sendScoreboard
}

function sendScoreboard(rcon, scoreboard, channel) {

    let players = getWhitelist(rcon); // ['samipourquoi', 'samiwhynot']
    getScores(rcon, players, scoreboard, channel);

    /*
    Couldn't figure out another way to do it,@
    so the rest of the code happens in the getScores() function…
    */
}

function getWhitelist(rcon) {

    let server;
    let serverNames =  Object.keys(helper.config.servers);
    
    // Gets the right whitelist file, by first fetching the right server in the config file
    for (let i = 0, server_; i < serverNames.length; i++) {
        server_ = helper.config.servers[serverNames[i]];
        if (
            server_.ip == rcon.host &&
            server_.rconPort == rcon.port &&
            server_.rconPassword == rcon.password
        ) {
            server = server_;
            break;
        }
    }

    let data = fs.readFileSync(path.dirname(path.dirname(server.logFile)) + '/whitelist.json'); // Reads whitelist.json
    data = JSON.parse(data);

    let players = [];

    data.forEach(player => {
        players.push(player.name);
    })

    return players;
}

async function getScores(rcon, players, scoreboard, channel) {
    let scores = [];
    let score;
    let i = 0;


    function loop() {
        if (i < players.length) {
            
            rcon.send(`/scoreboard players get ${players[i]} ${scoreboard}`) //scoreboard players get ${players[i]} ${scoreboard}

            rcon.once('response', response => {
                if (!response.includes('Can\'t get value of')) {

                    score = response.substring(response.indexOf(' has ') + 5, response.indexOf(' ['));

                    /*
                    samipourquoi has 1234 [scoreboard]
                    */
                    
                    if (score > 0) scores.push([players[i], score]);
                }

                i++;
                loop();
            })
        } else {
            /*
            scores is now equal to something like this: [['samipourquoi', 1234], ['samiwhynot', 4321]]
            We must now "sort" the scores from the biggest to the smallest
            */
           
            scores.sort(function(a, b) {
                return  b[1] - a[1];
            })
        
            let playersSorted = [];
            let scoresSorted = [];
            let total = 0;

            scores.forEach(values => {
                playersSorted.push(values[0]);
                scoresSorted.push(values[1]);
                total += parseInt(values[1]);
            })

            playersSorted.push("Total:");
            scoresSorted.push(total)

            scorecard(scoreboard, playersSorted, scoresSorted, channel);
        }
    }

    loop();
}

async function scorecard(scoreboard, names, scores, channel, gap = 35, borders = 10, height = names.length * 32 + gap + borders, width = 450) {
    const image = new Jimp(width, height, '#36393F'); // Creates a grey background

    // We load the fonts (it's in a bitmap format, so we can't just change the colour of the police: it must be made in the file itself)
    const white = await Jimp.loadFont('fonts/scorenameFont.fnt');
    const gray = await Jimp.loadFont('fonts/namesFont.fnt');
    const red = await Jimp.loadFont('fonts/scoresFont.fnt');

    var yCorrection = 0;
    var xCorrection = 0;

    await image.print(white, (width - Jimp.measureText(white, scoreboard)) / 2, 0, scoreboard); // Prints scoreboard name in the very middle
    
    for (let name of names) {
        if (name == 'Total:') {
            await image.print(white, borders, gap + yCorrection, name) // Prints the names 32 pixels apart
            yCorrection += 32;
        } else {
            await image.print(gray, borders, gap + yCorrection, name) // Prints the names 32 pixels apart
            yCorrection += 32;
        }
    }

    yCorrection = 0; // Resets the value

    for (const score of scores) {
        xCorrection = await Jimp.measureText(red, score.toString());
        await image.print(red, width - borders - xCorrection, gap + yCorrection, score); // Prints the names 32 pixels apart AND aligned on the right
        yCorrection += 32
    }

    image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        channel.send({
            files: [buffer]
        })
    });
}