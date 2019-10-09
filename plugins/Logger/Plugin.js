const Plugin = require("../../plugin-manager/plugin.js");
const chalk = require("chalk");

class LoggerPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "logger",
            name: "Logger",
            description: "Extended console logger using Chalk",
            version: "1.1",
            author: "bennyman123abc"
        })
    }

    load() {}

    /**
     * The information to log.
     * @param {string} msg The message.
     * @param {Plugin} plugin The plugin.
     */
    info(msg, plugin = null) {
        if (!plugin) {
            console.log(`[INFO] ${msg}`); /* Log as information. */
        } else {
            console.log(`[${plugin.name}] ${msg}`); /* Log as the plugin. */
        }
    }

    /**
     * Warning message.
     * @param {string} msg The message to warn about.
     */
    warning(msg) {
        console.log(chalk.keyword("orange")(`[WARNING] ${msg}`));
    }

    /**
     * Error message.
     * @param {string} msg The message to error about.
     */
    error(msg) {
        console.log(chalk.redBright(`[ERROR] ${msg}`));
    }

    /**
     * Critical message.
     * @param {string} msg The message to critical about. 
     */
    critical(msg) {
        console.log(chalk.red(`[CRITICAL] ${msg}`));
    }
}

module.exports = LoggerPlugin;