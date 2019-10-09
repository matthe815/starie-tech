var Command = require("../plugins/command-system/command");

class LoadCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "load",
            memberName: "load",
            description: "Remotely load a command.",
            category: "Bot Administration",
            permissionLevel: 3
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        var mess = msg.reply("Loading command...");
        var exists = this.cs.addCommand(args[0]);
        if (exists) { mess.edit(`Couldn't load command file ${args[0]} as it already exists.`); } else { mess.edit("Successfully loaded command."); }
    }
}

module.exports = LoadCommand;