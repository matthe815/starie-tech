var Command = require("../plugins/command-system/command");

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
        if(this.cs.isOwner(msg.author)) {
            msg.author.send("You are an owner!")
        }
        else {
            msg.author.send("You are not an owner...")
        }
    }
}

module.exports = AmIOwnerCommand;