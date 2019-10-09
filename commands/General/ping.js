var Command = require("../../plugins/Command System/command-system/command");
var {RichEmbed} = require("discord.js");

class PingCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "ping",
            memberName: "ping",
            description: "Ping the bot for information.",
            category: "General Commands"
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        var mess = await msg.channel.send(this.cs.manager.Translate({ message: "PING_FETCH", guild: msg.guild}));

        var embed = new RichEmbed();
        embed.setDescription(this.cs.manager.Translate({ message: "PONG", guild: msg.guild}));
        embed.addField(this.cs.manager.Translate({ message: "PING", guild: msg.guild}), Math.floor(this.client.ping), true);
        embed.addField(this.cs.manager.Translate({ message: "MESSAGE_ROUNDTRIP", guild: msg.guild}), Math.floor(mess.createdTimestamp - msg.createdTimestamp), true);

        mess.edit({embed});

    }
}

module.exports = PingCommand;