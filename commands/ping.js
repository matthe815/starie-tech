var Command = require("../plugins/command-system/command");

class PingCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "ping",
            memberName: "ping",
            description: "Ping the bot for information."
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        var mess = await msg.channel.send("Fetching ping...");
        mess.edit(`Pong! Heartbeat is ${this.client.ping}ms,\nMessage Roundtrip took ${mess.createdTimestamp - msg.createdTimestamp}ms.`);

    }
}

module.exports = PingCommand;