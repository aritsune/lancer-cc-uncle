# About

UNCLEBot is a Discord bot for looking up items and rules from LANCER, a tactical mech combat TTRPG.

It was originally developed by ari, and is currently being maintained by Fungus. 

Invite to your server: https://discordapp.com/api/oauth2/authorize?client_id=686085650222415887&permissions=76800&scope=bot

For help with UNCLEBot, visit the PilotNET server: https://discord.gg/lancer

# Commands and Features

| Command | Description |
| --- | --- |
| `::help` | Display a list of available commands, or detailed information for a specified command. |
| `::faq` | Look up an entry in the Lancer FAQ/Errata, available here: https://lancer-faq.netlify.app |
| `::invite` |  Get an invite link for UNCLE |
| `::dm-me` | UNCLEBot DMs you one message, enabling you to send commands via DM. |
| ``[[search term]]`` | Searches the LANCER compendium for <search term>, including supplements. Note that UNCLE doesn't have NPC information in it, since NPC content is content you're supposed to pay for.|
| `::structure` | Look up an entry on the structure check table. Parameters: Lowest dice rolled, Mech's remaining structure |
| `::stress` | Look up an entry on the Stress/Overheating table. Parameters: Lowest dice rolled, Mech's remaining stress |

## Sending Commands via DM

TL;DR You'll need to use the `::dm-me` command.

This is a limitation of the underlying discordjs library -- when a client starts, it doesn't load any of its DM channels into its cache.

Basically, when UNCLE reboots, UNCLE forgets all the DMs it was involved in, and can't manually fetch them. The workaround is to force UNCLE to DM you, which makes UNCLE become aware that your DM channel exists, enabling commands to be sent via DM

# Using your own instance of UNCLE

* Go to Discord's dev portal (https://discord.com/developers)
* Create a new application
* Go to Bot > Add Bot
* Get the bot's token
* Clone (or download) this repo
* Create a new file in the base folder, called `.env`
* Write the line `TOKEN=<YOUR TOKEN HERE>` in `.env`
* Run the bot locally with `npm run bot`
* Invite the bot to a server of your choosing with this URL: `https://discord.com/oauth2/authorize?client_id=<USER ID>&permissions=76800&scope=bot`.
  * If Discord introduces new API changes, this invite URL may change. Always look at the InviteCommand in `index.js` for the most recent version of the URL.
  * To get the `<USER ID>`, either 
    * Run the bot locally and grab the user ID from the command line. It'll be after `Logged in as <BOT USERNAME>#1234! (<USER ID>)`
    * Go to the developer portal; under General Information, copy the Application ID
    
As an added bonus, if you host your own instance of UNCLE, you can add your own content into the `/data` directory. Take an existing LCP and unzip it, and that's all you need. (Note that this only works with the new compcon data format; this also means that, as of now, GM-facing LCPs and NPC data cannot be used in UNCLE.)
