var Command = require("../plugins/command-system/command");

class ReloadCommandsCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "Reload Commands",
            memberName: "reload",
            description: "Reload bot commands",
            category: "Bot Administration",
            permissionLevel: 3,
            ownerOnly: true
        })

        this.cs = cs;
    }

    load(msg, args) {
        var c = manager.plugins.get("Command System");
        var status = c.reloadCommand(args[0]);
        if (status == true) { msg.author.send(`Reloaded the \`${args[0]}\` command successfully!`) } else { msg.author.send(`Couldn't reload \`${args[0]}\`, because: \`${status}\``) } 
        this.cs.reloadCommands();
        msg.author.send("Reloaded commands successfully!")
    }
}

module.exports = ReloadCommandsCommand;