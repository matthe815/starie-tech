var Command = require("../plugins/command-system/command");

class GameStatusCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "Game Status",
            memberName: "gamestatus",
            description: "Change the game status of the bot",
            category: "Bot Administration",
        })

        this.cs = cs;
    }

    async load(msg, args) {
        var game = args.join(' ')
        var mess = await message.reply("Changing game status...");
        await client.user.setActivity(game);
        mess.edit(`${mess.author}, Successfully set the game status to \`${game}\`!`)
    }
}

module.exports = GameStatusCommand;