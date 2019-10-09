const Plugin = require("../../plugin-manager/plugin.js");
const CommandGroup = require("./command-system/command-group.js");
const Discord = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");
const config = require("../../config/config.json");
var pm = null;
var ur = null;
var cl = null;
var Logger = null;
var CS = null;
var SQLite = null;

class CommandSystemPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: 'commandsystem',
            name: "Command System",
            description: "A highly advanced command system.",
            version: "1.0.2",
            author: "Matthe815"
        })
        
        this.manager = manager; /* The management system. */
        this.categories = new Discord.Collection(); /* All command categories. */
        this.commands = new Discord.Collection(); /* All commands, uncategorized. */
        this.permissions = new Discord.Collection(); /* Permissions cache. */

        switch(typeof config[this.name]['owners'] !== "undefined") {
            case true: /* If the owner is defined in the config. */
                this.owners = config[this.name]['owners']; /* Set the owners to the one defined in the config. */
                break;

            case false: /* If the owner is not defined in the config. */
                this.owners = []; /* Set a blank owner list. */
                config[this.name]['owners'] = []; /* Change it to blank in the config. */
                break;
        }

        switch(typeof config[this.name]['prefix'] !== "undefined") {
            case true: /* If the prefix is defined in the config. */
                this.prefix = config[this.name]['prefix']; /* Set the prefix to the one defined in the config. */
                break;

            case false: /* If the prefix isn't defined in the config. */
                this.prefix = "!"; /* Set to the default prefix. */
                config[this.name]['prefix'] = "!"; /* Change it to the default in the config. */
                break;
        }

        this.levels = new Discord.Collection(); // The current permission levels.

        this.levels.set(0, { level: 0, names: []});
        this.levels.set(1, { level: 1, names: []});
        this.levels.set(2, { level: 2, names: []});
        this.levels.set(3, { level: 3, names: []});
        this.levels.set(4, { level: 4, names: []});
        this.levels.set(5, { level: 5, names: []});
        this.levels.set(6, { level: 6, names: []});
        this.levels.set(7, { level: 7, names: []});

        for (var i=0;i<this.manager.getTranslations().length;i++) {
            var lf = this.manager.getTranslations()[i].roles;
            for (var i2=0;i2<lf.length;i2++) {
                this.levels.get(i).names = lf[i2]; // Apply the translation.
            }
        }
    }

    load() {
        var client = this.manager.client, Logger = this.manager.plugins.get("Logger"), SQLite = this.manager.plugins.get("SQLite"), CS = this; /* Create all of the variables. */

        this.manager.client.guilds.forEach((guild) => {
            var guildData = SQLite.get("guild_settings", "guild_id", guild.id);
            guild.prefix = guildData.prefix;
            guild.regionBased = guildData.regionBased;
            console.log(guild.prefix);
        });

        this.addCommandFromDir(__dirname + "../../../commands"); /* Add all of the commands. */

        if (this.owners) { /* If there are owners, loop through them. */
            client.once("ready", async () => { /* When the system is ready (once) fetch the owners. */
                for (const owner of this.owners) { /* Loop through all of the owners. */
                    client.fetchUser(owner).catch((err) => { /* Fetch the owner, and catch the errors. */
                        client.emit("warn", `Client failed to retreive an owner ${owner}`);
                        client.emit("error", err);
                    });
                };
            });
        }

        var db = SQLite.dbPromise; /* Get the DB. */

        // Loop through the users and get their permissions.
        db.each("SELECT * FROM permissions", (err, row) => {
            this.permissions.set(row.user, row.permissionLevel); /* Set it in the cache. */
        });

        /* Command message handler. */
        client.on("message", async (message) => {
            if (!message.content.startsWith(this.getInvoker(message)) && message.channel.type != "dm") /* If it's not a DM, and it doesn't start with a prefix, ignore it. */ 
                return;

            if (message.author.bot) /* If the user is a bot, ignore it. */
                return;

            var cmd = null; /* Create a blank command variable. */

            // Perform a prefix check & strip
            switch(message.channel.type) {
                case "dm":
                    cmd = message.content.split(" ").slice(0, 1).join(""); /* If it's a DM, split it into arguments. */
                    break;
                
                default:
                    cmd = message.content.slice(this.getInvoker(message).length).split(" ").slice(0, 1).join(""); /* If it's not a DM, strip the prefix and split it into arguments. */
                    break;
            }

            var user = message.author, guild = message.guild, command = this.commands.get(cmd.toLowerCase());

            if (!command) /* If there's no valid command, return nothing. */
                return;
    
            if (command.ownerOnly && !this.isOwner(user.id)) /* If the command is owner only, return an error if a non-owner user attempts to use it. */
                return message.reply("Only the folk whom own me can do this.");

            if (command.guildOnly && !guild)  /* If it's a guild-channel only command, error when it's not a guild-channel. */
                return message.reply("You can only do this from with guild channels.");
    
            var userLevel = await this.getUserLevel(user.id);

            if (userLevel < command.permissionLevel && !this.isOwner(user.id)) /* If the user doesn't have permission, return an error. */
                return message.reply(`You do not have permission to use the ${command.memberName} command. You must be atleast \`${this.levels.get(command.permissionLevel).name}\` or higher!`);
            
            if (command.throttling != null)
            {
                switch(command._throttles.has(message.author.id)) {
                    case true: /* If the throttle exists. */
                        if (command._throttles.get(message.author.id).time < new Date().getTime()) /* Reset the throttle. */
                            command._throttles.get(message.author.id).uses = 0;

                        command._throttles.get(message.author.id).uses++; /* Increase the throttle. */
                        break;

                    case false: /* If the throttle doesn't exist. */
                        command._throttles.set(message.author.id, { uses: 1, time: new Date().getTime() + (command.throttling.time * 1000) }); /* Set the throttle. */
                        break;
                }
            }

            var args = message.content.split(" ").slice(1); /* Split the arguments. */

            try {
                if (command.throttling && command._throttles.has(message.author.id) && command._throttles.get(message.author.id).uses > command.throttling.usages) /* Monitor the throttling. */
                    return message.reply(`You cannot use this command again for a while.`);

                return this.MakeDiscordReply(command.load(message, args), message, []); /* Return the invoked command. */
            } catch (e) {
                return message.reply(`An error has occurred while running this command: ${e}\nYou should never see this error! Please contact ${this.getOwnerList()}.`); /* Return a message if there's an error. */
            }
        });
    }

    postLoad() {
        SQLite = this.manager.plugins.get("SQLite"); /* Fetch the SQLite plugin. */

        if (!SQLite) /* If SQLite isn't installed, don't continue further. */
            return;

        SQLite.create("permissions", ["user", "permissionLevel"]); /* Create the required row for permissions. */
    }

    /**
     * Reload the command system file.
     * @param {Command} command
     * @returns {Boolean} 
     */
    reloadCommand(command) {
        return this.reloadCommands([command]); /* Move the command into the array and activate reloadCommands. */
    }

    /**
     * Get the command invoker.
     * @argument {Message} message The message to check stuff from.
     * @returns {string} The prefix.
     * @example this.getInvoker(msg);
     */
    getInvoker(message)
    {
        return this.prefix; /* Return the prefix. */
    }

    /**
     * Reload the command system file.
     * @param {Command[]} command
     * @returns {Boolean}
    */
    reloadCommands(commands) {
        commands.forEach((command) => {
            var command = this.commands.get(command); /* Fetch the command. */
            this.removeCommand(command); /* Remove the command from the system. */

            try {
                this.addCommand(command.memberName); /* Add the command back into the system. */
            } catch (e) {
                return e;
            }

            console.log(chalk.keyword('yellow')(`[DEBUG]`) + `: ${command.name} has been reloaded.`); /* Log it up. */

            return true; /* Return that it went well. */
        });
    }

    /**
     * Add a command to the command system.
     * @param {Command} command 
     */
    addCommand(command) {
        return this.addCommands([command]); /* Pass the argument as an array to addCommands. */
    }

    /**
     * Remove a command from the command system.
     * @param {Command} command 
     */
    removeCommand(command) {
        return this.removeCommands([command]); /* Pass the argument as an array to removeCommands. */
    }

    /**
     * Alias of addCommand.
     * @param {Command} command 
     * @deprecated
     */
    register(command) {
        return this.addCommands([command]); /* Pass the argument as an array to addCommands. */
    }

    /**
     * Remove a set of commands from the handler.
     * @param {Command[]} commands 
     */
    removeCommands(commands) {
        return commands.forEach(command => {
            this.categories
                .get(command.category) /* Get the command category. */
                .delete(command.memberName); /* Delete the member from the category. */

            this.commands /* Delete the command itself. */
                .delete(command.name);
        });
    }

    /**
     * Add a set of commands from a directory.
     * @argument {string} Path
     */
    addCommandFromDir(path)
    {
        require('require-all')({
            dirname: path,
            recursive: true,
            resolve: (Command) => {
                var cmd = new Command(this.manager.client, this); /* Create an instance of the command. */

                switch (this.categories.get(cmd.category) != null) {
                    case false:
                        this.categories
                            .set(cmd.category, new CommandGroup({
                                name: cmd.category,
                                shortName: cmd.category
                            })); /* Add the category. */
    
                        this.categories.get(cmd.category) /*  Get the category. */
                            .set(cmd.memberName.toLowerCase(), cmd); /* Set the new category. */
    
                        break;
    
                    case true:
                        this.categories.get(cmd.category)
                            .set(cmd.memberName.toLowerCase(), cmd); /* Set the command member. */
                        break;
                }

                this.commands.set(cmd.memberName, cmd); /* Add the command to the system. */
            }
        }); 
    }

    /**
     * Add a set of commands to the handler.
     * @param {Command[]} commands 
     */
    addCommands(commands) {
        commands.forEach((command) => {
            try {
                var command = require(`../commands/${command}`); /* Load the command. */
            } catch (e) {
                if (Logger)
                    return Logger.error(`An error has occured while loading ${command}: ${e}`); /* Error */
                else
                   return console.log(`An error has occured while loading ${command}: ${e}`); /* Error */                   
            }

            try {
                command = new command(this.manager.client, this); /* Create a brand new command object. */
            } catch (e) {
                if (Logger)
                    return Logger.error(`An error has occured while initalizing ${command}: ${e}`); /* Error */
                else
                   return console.log(`An error has occured while initalizing ${command}: ${e}`); /* Error */   
            }

            if (!command) /* If it's an invalid command, return nothing. */
                return;
        
            if(command.memberName.includes(" ")) /* If there's a space in the member name, error. */
                throw `Command MemberNames cannot have spaces.`;

            if (this.commands.has(command.memberName.toLowerCase())) /* If the command already exists, error. */
                throw `Command ${command.memberName} is already initalized!`;

            var category = this.categories.get(command.category); /* Fetch the category. */

            console.log(typeof category == "undefined");

            switch (typeof category == "undefined") {
                case true:
                    this.categories
                        .set(command.category, new CommandGroup({
                            name: command.category,
                            shortName: command.category
                        })); /* Add the category. */

                    category /*  Get the category. */
                        .set(command.memberName.toLowerCase(), command); /* Set the new category. */

                    break;

                case false:
                    category
                        .set(command.memberName.toLowerCase(), command); /* Set the command member. */
                    break;
            }

            this.commands /* Set the member. */
                .set(command.memberName, command);

            return false;
        });
    }

    /**
     * Add a brand new command type.
     * @param {CommandType} command 
     */
    addCommandType(command) {
        this.commands
            .set(command.memberName, command); /* Add a new command. */
    }

    /**
     * Checks if the user is an owner of the bot.
     * @param {UserResolvable} user
     * @returns {Boolean} 
     */
    isOwner(user) {
        if (!this.owners) /* If there's no owners, return. */
            return false;

        user = this.manager.client.resolver
            .resolveUser(user); /* Resolve the user. */

        if (!user) /* If it's an invalid user, die. */
            throw new RangeError('Unable to resolve user.');

        if (typeof this.owners === 'string') /* If the type of owners is a string, treat it as such. */
            return user.id === this.owners;

        if (this.owners instanceof Array) /* If the type of owners is an array, treat it as such. */
            return this.owners.includes(user.id);

        if (this.owners instanceof Set) /* If the type of owners is a set, treat it as such. */
            return this.owners.has(user.id);

        throw new RangeError('There are no owners defined.'); /* Say that there's no owners defined. */
    }

    /**
     * Create a user object in the database.
     * @param {Snowflake} user 
     */
    createUser(user) {
        SQLite /* Insert into the permissions object. */
            .insert("permissions", ["user", "permissionLevel"], [user, 0]);

        this.permissions.set(user, 0); /* Set the user's permission within the cache. */
    }

    /**
     * Update the user's group inside of the database.
     * @param {UserResolvable} authorizer 
     * @param {UserResolvable} user 
     * @param {UserGroup} role 
     * @returns {String}
     */
    async updateRole(authorizer, user, role) {
        var userLevel = await this.getUserLevel(authorizer); /* Fetch the authorizer's level. */

        if (userLevel <= role && !this.isOwner(authorizer))  /* If the authorizers role is less than the role provided, and the user isn't an owner, error. */
            return "no_permission";
        
        if (await this.getUserLevel(user) >= userLevel && !this.isOwner(authorizer)) /* If the user is greater than the authorizer, and the authorizer isn't an owner, error. */
            return "no_permission_user";

        if (!this.levels.has(role)) /* If the role doesn't exist, error. */
            return "no_role";
        
        var trueRole = role;

        SQLite /* Update the user's table row. */
            .updateTable("permissions", "permissionLevel", trueRole, "user", user);

        return trueRole; /* Return the result. */
    }

    /**
     * Get the user's role for the bot.
     * @param {UserResolvable} user 
     * @return {UserGroup}
     */
    async getUserLevel(user) {
        
        try {
            if (user.id) /* Detect if it's a user object. */
                user = user.id;

            var row = this.permissions.get(user); /* Get the user's permission. */

            if (!row) /* If they don't have a row, create one. */
                this.createUser(user);

            return row ? row : 0;
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Get all of the owners in a nice little list.
     * @returns {User[]}
     * @deprecated
     */
    getOwnerList() {
        if (!this.owners) /* If there's no owners, return null. */
            return null;

        if (typeof this.owners === 'string') /* If it's a string, return it as an array. */
            return [this.manager.client.users.get(this.owners)];

        const owners = [];
        for (const owner of this.owners) /* Fetch each owner and push the into the owners array. */
            owners.push(this.manager.client.users.get(owner));

        return owners; /* Return the owners. */
    }

    /**
     * Get all of the owners in a nice little list.
     * @returns {User[]}
     */
    get ownerlist()
    {
        if (!this.owners) /* If there's no owners, return null. */
            return null;

        if (typeof this.owners === 'string') /* If it's a string, return it as an array. */
            return [this.manager.client.users.get(this.owners)];

        const owners = [];
        for (const owner of this.owners) /* Fetch each owner and push the into the owners array. */
            owners.push(this.manager.client.users.get(owner));

        return owners; /* Return the owners. */
    }

    /**
     * Create a Discord reply.
     */
    async MakeDiscordReply(message, msg, overwrites)
    {
        if (!message)
            return;

        var translation = this.manager.Translate({ guild: msg.guild, message }, overwrites);
        return await msg.channel.send(translation);
    }
}

module.exports = CommandSystemPlugin;