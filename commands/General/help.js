var Command = require("../../plugins/Command System/command-system/command");
var discord = require("discord.js");

class HelpCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "help",
            memberName: "help",
            description: "Shows this help command.",
            category: "General Commands",
            throttling: {
                time: 60,
                usages: 1
            }
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        if (msg.channel.type != "dm") // Only display that a DM was sent if you're not in a DM.
            msg.reply(this.cs.manager.Translate({ message: "DM_SENT", guild: msg.guild}));

        var cachedCategories = [], richEmbed = new discord.RichEmbed(); // The cached categories.

        // Loop through all of the categories.
        for (var gCat of this.cs.categories) 
        {
            cachedCategories.push(`:${(toName(cachedCategories.length))}: **${gCat[0]}**`); // Push a localized version of the names.
        }

        richEmbed.setDescription(cachedCategories.join("\n")); // Set the description to something human readable.
        var mess = await msg.author.send(richEmbed); // Send the rich embed.

        mess.react("◀"); // Add a back arrow.

        // Add the reaction numbers.
        for (var i=0;i<cachedCategories.length;i++) {
            mess.react(toEmoji(i)); // React with the number.
            await timer(1000); // Delay the loop.
        }

        var col = mess.createReactionCollector((reaction, user) => user == msg.author, {time: 128000});
        
        col.on("collect", (r) => {
            if (r.emoji.name == "◀") {
                richEmbed.setDescription(cachedCategories.join("\n")); // Set the description to something human readable.
                mess.edit(richEmbed); // Edit the RichEmbed into place.
            }
            else
                LoadCategory(toInt(r.emoji.name)-1, richEmbed, mess, this.cs);
        });
    }
}

function LoadCategory(category_id, re, msg, cs) {
    var commandInfo = []; // cached command info.
    var commands = cs.categories.array()[category_id]; // Get the commands cached.

    // Loop through all of the commands.
    for (command of commands) {
        commandInfo.push(`**${command[1].name}**:\n${command[1].description}\n${cs.prefix}${command[1].usage}\n`);
    }

    re.setDescription(commandInfo.join("\n")); // Create the new description.
    msg.edit(re); // Edit the RichEmbed into place.
}

function timer(ms) {
    return new Promise(res => setTimeout(res, ms)); // Create a delay timer.
}   

function toName(int) {
    return ["one","two","three","four","five","six","seven","eight","nine"][int];
}

function toEmoji(int) {
    return ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'][int];
}

function toInt(string) {
    return {'1⃣':1,'2⃣':2,'3⃣':3,'4⃣':4,'5⃣':5,'6⃣':6,'7⃣':7,'8⃣':8,'9⃣':9}[string];
}

module.exports = HelpCommand;