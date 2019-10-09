const Plugin = require("../../plugin-manager/plugin.js");
const chalk = require("chalk");
var MyInterface = null;
var Logger = null;

class PluginViewerPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: 'plugin-viewer',
            name: "Plugin Viewer",
            description: "Displays all the currently loaded plugins.",
            version: "1.0.1",
            author: ["Matthe815", "bennyman123abc"]
        })
    }

    load() {
        Logger = this.manager.plugins /* Get the logger. */
                                .get("Logger");

        if (this.manager.plugins.get("My Interface")) /* If My Interface is present, install the commands.*/
            this.manager.plugins.get("My Interface").register([new PluginsCommand(this.manager), new PluginInfoCommand(this.manager)]);
    }
}

class PluginsCommand {
    constructor(manager) {
        this.manager = manager;
        this.name = "plugins";
    }

    response(args) {
        var plugins = []; /* A list of all of the arrays. */

        this.manager.plugins.forEach((plugin) => /* Obtain all of the plugins. */
            plugins.push(plugin.name)
        );

        console.log(plugins.join(", ")); /* Log the plugins. */
    }
}

class PluginInfoCommand {
    constructor(manager) {
        this.manager = manager;
        this.name = "plugininfo";
    }

    response(args) {
        var plugin = this.manager.plugins.get(args.join(' ')); /* The plugin in question. */
        if (!plugin) /* Quit if it's not a plugin. */
            return;

        console.log(chalk.green(`Name: ${plugin.name}\nDescription: ${plugin.description}\nAuthor(s): ${plugin.author}\nVersion ${plugin.version}`)) /* Log it's information. */
    }
}

module.exports = PluginViewerPlugin;