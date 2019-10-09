/// *************************
/// Script Start スクリプト・スターター
/// *************************
const EventEmitter = require("events"),
    { Client } = require("discord.js"),
    fs = require("fs"), 
    ci = require("CI-Intrepreter").Loader, 
    exclusions = require("../config/exclusions.json"), 
    translations = {};

class AutoLoader extends EventEmitter {

    /**
     * Create the plugin loader.
     * @param {*} index The "main" code file.
     * @param {*} client The Discord client.
     * @param {*} pluginDir The plugin directory to initially scan.
     */
    constructor(index, client, pluginDir = __dirname + "/plugins") {
        super();

        this.client = client;
        this._plugins = new Map();
        this._defaultPluginDirectory = pluginDir;

        /// *************************
        /// Basic File Check バセーク・フィル・チェク
        /// *************************

        if (!fs.existsSync("plugins"))
            fs.mkdirSync("plugins");

        if (!fs.existsSync("config"))
            fs.mkdirSync("config");
    }

    /**
     * Fetch a list of the currently loaded plugins.
     * @return {Plugin[]}
     */
    get plugins()
    {
        return this._plugins; /* Return the local plugin cache. */
    }

    /**
     * Initalize the plugin management system.
     * @argument {string} dir The directory to scan.
     */
    Initalize(dir)
    {
        /// *************************
        /// Translations 翻訳
        /// *************************
        var lang = fs.readdirSync("lang");

        for (var file of lang) {
            if (file.includes("trans"))
                return;

            translations[file.slice(0, -5)] = JSON.parse(fs.readFileSync(`lang/${file}`));
        }

        /// *************************
        /// Plugin loading プラグイン・ローダ
        /// *************************
        var plugins = require('require-all')({
            dirname: dir,
            filter: "Plugin.js",
            recursive: true,
            resolve: (plugin) => {
                try {
                    this.LoadPlugin(new plugin(this));
                } catch (e) {
                    console.log(e);
                }
            }
        });

        try {
            this.plugins.forEach((plugin) => { plugin.preLoad(); });
            this.plugins.forEach((plugin) => { plugin.load(); });
            this.plugins.forEach((plugin) => { plugin.postLoad(); setInterval(plugin.update, 100) });
        } catch (e) {
            console.log("An error has occured when running one of the events:");
            console.log(e);
        }
    }

    /**
     * Load a new plugin within the framework.
     * @param {Plugin} plugin 
     */
    LoadPlugin(plugin)
    {
        switch (typeof plugin) {
            case "string":
                try {
                    plugin = require(plugin); /* Load the plugin into the system. */
                    plugin = new plugin(this); /* Construct a new plugin object off of that. */
                } catch (e) {
                    console.error(e);
                }

                if (!plugin.id || plugin.id == "")
                    return console.error("Invalid plugin provided, plugins must have an ID.");

                this.emit("plugin loaded", plugin);
                return this._plugins.set(plugin.id, plugin); /* Assign a key to the plugin. */
                break;

            case "object": /* If it's an object, assume it's a plugin. */
                if (!plugin.id || plugin.id == "")
                    return console.error("Invalid plugin provided, plugins must have an ID.");

                this.emit("plugin loaded", plugin);
                return this._plugins.set(plugin.id, plugin); /* Assign a key to the plugin. */
                break;

            default:
                console.error("Plugin type provided to loader is invalid");
                break;
        }
    }

    /**
     * Unload a plugin from the system, also firing the Unload event upon being unloaded.
     * @argument {string} plugin The plugin name.
     */
    UnloadPlugin(plugin)
    {
        if (!this._plugins.has(plugin))
            return console.error("Requested plugin to unload doesn't exist.");

        this.plugins.get(plugin)
            .unLoad();

        delete this.plugins
            .get(plugin);

        this.plugins
            .remove(plugin);
    }

    /**
     * Load a translation based on the requested & server language.
     * @argument {string} message Translate the message.
     * @argument {string} trans_id The id of the translation to use.
     * @argument {string[]} args The args to replace.
     * @returns {string} Translated database.
     */
    Translate(data, args=[]) 
    {
        var trans = this.GetTranslationRegion(data.guild.region, data.guild.regionBased)[data.message];

        while (trans.includes("%s")) {
            trans = trans.replace("%s", args[0]);
            args = args.slice(-1);
        }

        return trans;
    }

    /**
     * Return currently loaded translations.
     * @returns {string[]}
     */
    getTranslations() 
    {
        return translations;
    }

    /**
     * Find a region, return English if not localized.
     * @param {string} region 
     */
    GetTranslationRegion(region, regionBased)
    {
        return translations[region] != undefined && regionBased ? translations[region].translations : translations["us_west"].translations;
    }

    /**
     * Return the current Discord client.
     * @returns {Client}
     */
    GetClient()
    {
        return this.client;
    }
}
/**
 * Script End スクリプト・ンド
 */

module.exports = AutoLoader;