const Plugin = require("../../plugin-manager/plugin.js");
var clear = require("clear")
var MyInterface = null;

class ClearPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "console-clear",
            name: "Console Clear",
            description: "Clears the console on command",
            version: "1.1",
            author: ["Matthe815", "bennyman123abc"]
        })

        this.integrated = false;
        MyInterface = manager.plugins.get("My Interface");
    }

    load() {
        if (MyInterface) MyInterface.register(new ClearCommand(this.manager)); // If My Interface is installed, go through with the integration.
        else console.log("My Interface is not installed!") // Else stop here.
    }
}

class ClearCommand {
    constructor(manager) {
        this.manager = manager;
        this.name = "clear";
        this.aliases = ['cls', 'clr'];
    }

    response(args) {
        clear(); // Clear the console.
    }
}

module.exports = ClearPlugin;