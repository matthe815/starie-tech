var Command = require("../../plugins/Command System/command-system/command");

class AmIOwnerCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "Am I Owner?",
            memberName: "amiowner",
            description: "Tells you if you are an owner to this bot",
            category: "Debug",
        })

        this.cs = cs;
    }

    load(msg, args) {
        this.cs.isOwner(msg.author) ? msg.author.send(this.cs.manager.Translate({ message: "YOU_ARE_OWNER", guild: msg.guild})) : msg.author.send(this.cs.manager.Translate({ message: "YOU_ARE_NOT_OWNER", guild: msg.guild}));
    }
}

module.exports = AmIOwnerCommand;