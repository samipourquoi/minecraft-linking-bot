# How to use it
First of all, install [node.js](https://nodejs.org/en/)
Once installed, open this folder (use `cd path/to/directory`) and then type `npm install` in the console. It will install all the require libraries.
Launch the bot with `node main.js`.
You can have as many servers as you like in the config.json file!
Don't forget to activate in each server.properties these fields:
- enable-rcon: true
- rcon-port: <choose a port>
- rcon-password: <choose a password>
- enable-query: true
- query-port: <choose a port>

Sometimes, it might crash because of the RCON, which can be buggy sometimes. I encourage you to use the npm package called [nodemon](https://www.npmjs.com/package/nodemon), to automatically restart when it has crashed.
To use it, first do `npm install -g nodemon`, and then do `nodemon main.js`.
You can stop the process with `killall node`.

# Features
In addition of the minecraft linking, you can also do:
- !execute <command> (in the right bridge channel): executes the command on the server (settings in config.json)
- !scoreboard <scoreboard>: 
    - In game, displays the scoreboard
    - On discord, shows the list of all the scores for all the whitelisted players
- !online: gives a list of all the online players on every server

# Credits
Developped by samipourquoi. Some ideas come from Daniel (from the Hypnos server). Bot made for the Minecraft technical server called [EndTech](https://endte.ch).
Contact me via the EndTech's discord.
