var Command = require("../plugins/command-system/command");

class UnloadCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "unload",
            memberName: "unload",
            description: "Disable a command.",
            category: "Bot Administration",
            permissionLevel: 3
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        var mess = msg.reply(`Disabling command...`);
        if (!this.cs.commands.has(args[0])) return mess.edit(`This command isn't loaded!`); 
        this.cs.removeCommand(args[0]);
        mess.edit(`Successfully disabled ${args[0]}!`);
    }
}

module.exports = UnloadCommand;