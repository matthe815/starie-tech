class Command {
    /**
     * @typedef {Object} ThrottlingInfo
     * @property {number} usages The amount of times the command can be used in the span of time.
     * @property {number} time The time in between the throttles.
     * 
     * @typedef {Object} CommandInfo
     * @property {string} name The command's full-friendly name.
     * @property {string} memberName The command's execution phrase.
     * @property {string} description The description associated with the plugin.
     * @property {string|string[]} usage The usage tutorial for the command.
     * @property {number} permissionLevel The permission level required to invoke the command.
     * @property {boolean} ownerOnly Whether or not the command is restricted to owner users only.
     * @property {boolean} guildOnly Whether or not the command must be used in a guild channel.
     * @property {string} category The string associated with the command's category.
     * @property {ThrottlingInfo} throttling Information associated with throttling. 
     * 
     * @param {Client} client 
     * @param {CommandInfo} data 
     * 
     * @constructor
     */
    constructor(client, data) {
        if (!data) return console.log("Cannot properly setup a command without the data!");
        this.client = client;

        /**
         * The plugin's name.
         * @type {string}
         */
        this.name = data.name ? data.name : "";

        /**
         * The plugin's invoker name.
         * @type {string}
         */
        this.memberName = data.memberName;

        /**
         * The plugin's description.
         * @type {string}
         */
        this.description = data.description ? data.description : "";

        /**
         * The plugin's usage tip.
         * @type {string|string[]}
         */
        this.usage = data.usage ? data.usage : data.name.replace(/ /g, "").toLowerCase();

        /**
         * The plugin's permission level.
         * @type {number}
         */
        this.permissionLevel = data.permissionLevel ? data.permissionLevel : 0;

        /**
         * Whether or not you must be an owner to activate this command.
         * @type {boolean}
         */
        this.ownerOnly = data.ownerOnly ? data.ownerOnly : false;

        /**
         * Whether or not you must be in a guild to use this command.
         * @type {boolean}
         */
        this.guildOnly = data.guildOnly ? data.guildOnly : false;

        /**
         * The category that the command is currency in.
         * @type {string}
         */
        this.category = data.category ? data.category : "General";

        this._throttles = new Map();

        /**
         * The throttling information for the command.
         * @type {string}
         */
        this.throttling = data.throttling ? data.throttling : null;
    }

    load() {
        throw "Load not initalized.";
    }
}

module.exports = Command;