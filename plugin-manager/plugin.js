const EventEmitter = require("events");
const AutoLoader = require("./autoloader");

/**
 * An object representing a plugin.
 * @see {AutoLoader}
 */
class Plugin extends EventEmitter {
    
    /**
     * Called whenever a plugin is constructed.
     * @typedef {Object} PluginInfo
     * @property {string} id The plugin identifier.
     * @property {string} name The plugin's name.
     * @property {string} description The plugin's description.
     * @property {string} version The plugin's version.
     * @property {string|string[]} author The plugin's authors.
     * @property {string[]} aliases The plugin aliases.
     * 
     * @param {AutoLoader} manager The auto-loader which loaded the plugin.
     * @param {PluginInfo} data Any additional data applied to the plugin.
     * @constructor
     */
    constructor(manager, data)
    {
        super(); /* Import everything from the main class.*/

        /**
         * The plugin manager.
         * @type {AutoLoader}
         */
        this.manager = manager || console.error("One or more plugins wasn't initalized with the AutoLoader class!");

        /**
         * The identifier for the plugin.
         * @type {string}
         */
        this.id = data.id || null;

        /**
         * The name of the plugin, defaults to the ID if not present.
         * @type {string}
         */
        this.name = data.name || data.id || null;

        /**
         * The description of the plugin.
         * @type {string}
         */
        this.description = data.description || null;

        /**
         * The current version that the plugin is on.
         * @type {string}
         */
        this.version = data.version || null;

        /**
         * The author(s) of the plugin.
         * @type {string|string[]}
         */
        this.author = data.author || null;

        /**
         * The alternative aliases of the plugin.
         * @type {string[]}
         */
        this.aliases = data.aliases || [];
    }
    
    /**
     * The preLoad event called whenever the plugin starts to load.
     * @event preLoad
     */
    preLoad() {}

    /**
     * The load event called whenever the plugin is fully loaded.
     * @throws {NOTINITALIZED}
     * @event load
     */
    load() {}

    /**
     * The postLoad event called whenever the plugin is past loaded.
     * @event postLoad
     */
    postLoad() {}

    /**
     * The constant event called whenever a tick has passed.
     * @event update
     */
    update() {}

    /**
     * Obtain the autoloader system.
     * @returns {AutoLoader} The autoloader.
     */
    GetAutoLoader()
    {
        return this.manager;
    }
}

module.exports = Plugin;