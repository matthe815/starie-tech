const Plugin = require("../../plugin-manager/plugin");
const request = require("request");
const fs = require("fs");
const crypto = require("crypto");

class UpdaterPlugin extends Plugin {
    constructor(manager)
    {
        super(manager, {
            id: "updater",
            name: "Updater",
            author: ["Matthe815"],
            description: "Update all of the Starie Tech files to the most recent state upon start-up",
            version: "2.0"
        });

        this.updateURL = "https://framework.starie.rocks/update";
        this.updateFileURL = "https://framework.starie.rocks/files/framework"
    }

    async load() {
        this.getUpdates(); // Get the updates.
    }

    /**
     * Get the file integrity of every main file.
     * @returns {string[]}
     */
    getAllFileIntegrities() {
        var autoloader = fs.readFileSync("plugin-manager/autoloader.js"), index = fs.readFileSync("index.js"), pluginjs = fs.readFileSync("plugin-manager/plugin.js"), updater = fs.readFileSync(`${__dirname}/Plugin.js`), hashes = new Map(); // Get all of the important files for updating.
        
        hashes.set("plugin-manager/autoloader.js", this.getFileHash(autoloader));
        hashes.set("index.js", this.getFileHash(index));
        hashes.set("plugin-manager/plugin.js", this.getFileHash(pluginjs));
        hashes.set("plugins/Updater/Plugin.js", this.getFileHash(updater));

        return hashes; // Return the integrities.
    }

    /**
     * Get a file's MD5 hash.
     * @param {File} file 
     */
    getFileHash(file) {
        var hash = crypto.createHash("md5", {encoding: "hex"}); // Create a new hash.
        hash.update(String(file)); // Write the file to the newly created hash.

        return hash.digest("hex"); // Return the hash.
    }

    /**
     * Make an HTTP request.
     * @param {string} url 
     */
    async getUpdates() {
        request.get(this.updateURL, (err, res, body) => {
            body = JSON.parse(body);
            var integrities = this.getAllFileIntegrities(); // Get file integrities.
            console.log(integrities);

            for (var item in body["files"]) {
                if (integrities.get(body["files"][item].file) != body["files"][item].md5) // See if the hashes are inaccurate.
                    this.downloadFile(body["files"][item].file); // Download the file if so.
            }

            console.log("File integrity successfully confirmed.");
        });
    }

    /**
     * Download a file from the CDN.
     * @param {string} url 
     */
    async downloadFile(url) {
        var file = `${this.updateFileURL}/${url}`;

        try {
            console.log(`Updating ${url}...`);
            var fileCons = fs.createWriteStream(url);
            var request = http.get(file, (response) => {
                response.pipe(fileCons);
                fileCons.on('finish', () => {
                    fileCons.close();
                });
            });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = UpdaterPlugin;