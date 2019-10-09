const Plugin = require("../../plugin-manager/plugin.js");
const readline = require('readline');
const chalk = require('chalk')
var Logger = null;
var UserAuthentication = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class MyInterfacePlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "my-interface",
            name: "My Interface",
            description: "Adds a simple console line interface to your console.",
            version: "1.1b",
            author: "Matthe815"
        })

        this.commands = new Map(); // The command collection.
        Logger = manager.plugins.get("Logger"); /* Fetch the logger plugin. */
        UserAuthentication = manager.plugins.get("user-auth"); /* Fetch user-auth. */
    }

    load() {
        UserAuthentication = this.manager.plugins.get("user-auth");
        this.register([new HelpCommand(this.manager, this), new RestartCommand(this.manager, this)]); /* Register the commands. */
    }
  
    postLoad() {
        this.ask() /* Ask for a response. */
    }

    /**
     * Request for a response.
     */
    ask() {
        rl.question(chalk.gray(`${UserAuthentication.getUser().username}@localhost: `), (answer) => {
            this.intepretCommand(answer.toLowerCase().split(" ").slice(0, 1).join(" "), answer.split(" ").slice(1));
            this.ask();
        });

    }

    /**
     * Register a brand new command.
     * @param {Command|Command[]} command 
     */
    register(command) {
        if (Logger) /* Tell the user that the command has been successfully registered if Logger exists. */
            Logger.info(`${command} successfully registered`, this);

        console.log(typeof command);

        if (Array.isArray(command))
        {
            command.forEach((cmd) => {
                this.commands /* Register the command to the handler. */
                    .set(command.name, command);

                if (command.aliases == null) /* Stop here if there's no aliases presenet. */
                    return;
        
                command.aliases.forEach((alias) => {
                    this.commands /* Register the aliases as well. */
                        .set(alias, command);
                });
            })
        } else {
            this.commands /* Register the command to the handler. */
                .set(command.name, command);

            if (command.aliases == null) /* Stop here if there's no aliases presenet. */
                return;
    
            command.aliases.forEach((alias) => {
                this.commands /* Register the aliases as well. */
                    .set(alias, command);
            });
        }
    }

    /**
     * Intepret the command as a command.
     * @param {string} commandName The command to execute.
     * @param {string[]} args The arguments to pass to the command.
     */
    intepretCommand(commandName, args) {
        try {
            if (this.commands.has(commandName)) /* If the command exists, shoot the response. */
                return this.commands.get(commandName).response(args);
        } catch (e) {
            console.log(e);
        }
    }
}

class HelpCommand {
    constructor(manager, ie) {
        this.manager = manager;
        this.name = "help";
        this.ie = ie;
    }
    
    response(args) {
        var cmds = Array.from(this.ie.commands.keys());
        console.log(cmds.join(", "));
    }
}

class RestartCommand {
    constructor(manager, ie) {
        this.manager = manager;
        this.name = "restart";
        this.ie = ie;
    }

    response(args) {
        this.manager.ReloadAll();
        console.log(chalk.gray("Successfully reloaded all commands."));
    }
}

module.exports = MyInterfacePlugin;