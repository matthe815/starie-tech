var Command = require("../plugins/command-system/command");
var discord = require("discord.js");

class HelpCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "help",
            memberName: "help",
            description: "Shows this help command."
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        if (msg.channel.type != "dm") msg.reply("I have sent you a DM with information.");

        var emb = new discord.RichEmbed();
        var commandList = [];
        var userLevel = await this.cs.getUserLevel(msg.author);

        emb.setColor("RANDOM");

        try {
            
        this.cs.categories.forEach((category) => {
            commandList = [];

            category.forEach(command => {
                if (userLevel < command.permissionLevel) return;
                commandList.push(`**\\${this.cs.prefix}${command.memberName}**: ${command.description}`);   
            });  

            emb.addField(category.name, commandList.join("\n"));
        });

        // msg.author.send(commandList.join("\n"));
        msg.author.send(`${msg.guild ? "To use a command in " + msg.guild.name + ", " : ""}${msg.guild ? "use" : "Use"} ${this.cs.prefix}<command> or ${this.client.user} <command>. For example, ${this.cs.prefix}prefix or ${this.client.user} prefix.\nTo run a command in this DM, simply use the command with no prefix.\n\nUse help <command> to view detailed information about a specific command.\nUse help all to view a list of all commands, not just available ones.\n`, { embed : emb });
        
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = HelpCommand;