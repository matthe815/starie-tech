const SQLite = require("sqlite3");
var Logger = null;
const Plugin = require("../../plugin-manager/plugin.js");

class SQLitePlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "SQLite",
            name: "SQLite",
            description: "A SQLite client.",
            version: "1.0",
            author: "Matthe815"
        });

        Logger = manager.plugins.get("Logger");
        this.dbPromise = new SQLite.Database('db.sqlite3');
    }

    load() {
        return false;
    }

    async query(query) {
        var db = this.dbPromise;

        if (!db) {
            if (!Logger) {
                Logger.error("Cannot access a non-existent database.");
            } else {
                console.error("Cannot access a non-existent database.");
            }
        }
        
        await db.run(query);
    }

    async create(table, fields) {
        var db = await this.dbPromise;
        if (!db) {
            if (!Logger) {
                Logger.error("Cannot access a non-existent database.");
            } else {
                console.error("Cannot access a non-existent database.");
            }
        }
        await db.run(`CREATE TABLE IF NOT EXISTS \`${table}\`(${fields.join(" VARCHAR(255), ")} VARCHAR(255))`);
    }

    async insert(table, fields, values) {
        var db = await this.dbPromise;
        return db.serialize(async () => {
            if (!db) {
                if (!Logger) {
                    Logger.error("Cannot access a non-existent database.");
                } else {
                    console.error("Cannot access a non-existent database.");
                }
            }
    
            try {
                await db.run(`INSERT INTO \`${table}\`(\`${fields.join("`, `")}\`) VALUES('${values.join("', '")}')`);
            } catch (e) {}
        });
    }

    async delete(table, id) {
        var db = await this.dbPromise;
        if (!db) {
            if (!Logger) {
                Logger.error("Cannot access a non-existent database.");
            } else {
                console.error("Cannot access a non-existent database.");
            }
        }
        await db.run(`DELETE FROM \`${table}\` WHERE \`id\`="${id}"`);
    }

    async get(table, key, id, sortDesc=false, getAll=false, limit=null, after=null) {
        var db = await this.dbPromise;
        return db.serialize(async () => {
            if (!db) {
                if (!Logger) {
                    Logger.error("Cannot access a non-existent database.");
                } else {
                    console.error("Cannot access a non-existent database.");
                }
            }
    
            var query = await db.all(`SELECT * FROM \`${table}\` WHERE \`${key}\` = ?`, id);
    
            if (getAll)
            {
                return query ? query : null;
            }
            else
            {
                return query ? query[0] : null;
            }
        })
    }

    async updateTable(table, row, value, key, id) {
        var db = await this.dbPromise;
        if (!db) {
            if (!Logger) {
                Logger.error("Cannot access a non-existent database.");
            } else {
                console.error("Cannot access a non-existent database.");
            }
        }

        var query = await db.run(`UPDATE \`${table}\` SET \`${row}\`=? WHERE \`${key}\` = ?`, [value, id]);

        return;
    }
}

module.exports = SQLitePlugin;