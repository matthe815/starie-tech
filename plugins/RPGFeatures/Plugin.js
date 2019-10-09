const Plugin = require("../../plugin-manager/plugin");
const {Collection} = require("discord.js");
const Character = require("./Structures/Character.js");

class RPGPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "rpg-features",
            name: "Rpg Features",
            version: "1.0.0",
            author: "Matthe815"
        });

        this.characters = new Collection(); // The list of characters belonging to people.
        this.characterOwners = new Collection(); // The list of character owners.
        this.SQLite = null; // The SQLite Plugin.
        this.classes = new Collection(); // The classes.
        this.items = new Collection(); // The items.
    }

    preLoad() {
        this.SQLite = this.manager.plugins.get("SQLite"); // Get the SQLite plugin. 
        var db = this.SQLite.dbPromise; // Get the DB.

        // Loop through each row and fetch the information.
        db.each("SELECT * FROM characters", (err, row) => {
            this.characters.set(`${row.first_name} ${row.last_name}`, new Character(this, row)); // Set the character data.
            this.characterOwners.set(row.Owner, `${row.first_name} ${row.last_name}`)
        });
    }

    load() {
        require("require-all")({ 
            dirname: __dirname + "/Classes",
            recursive: true,
            resolve: (Class) => {
                Class = new Class(); // Get that.
                this.classes.set(Class.id, Class); // Set the new class.
            }
        });

        require("require-all")({ 
            dirname: __dirname + "/Items",
            recursive: true,
            resolve: (Item) => {
                Item = new Item(); // Get that.
                this.items.set(Item.id, Item); // Set the new class.
            }
        });
    }
}

module.exports = RPGPlugin;