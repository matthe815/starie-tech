const Plugin = require("../../plugin-manager/plugin.js"), endpoint_folder = `${__dirname}/endpoints`, fs = require("fs");

class WebPanelPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: 'api-server',
            name: "API Server",
            description: "An api web server!",
            version: "1.0.0",
            author: "Matthe815"
        })

        this.SQLite;
    }

    async load()
    {
        // The endpoint thingy.
        for (var endpoint of fs.readdirSync(endpoint_folder)) {
            var end = require(`${endpoint_folder}/${endpoint}`); //  The point file.
            new end(this).register(); // Require the endpoint.
        }
    }
}

module.exports = WebPanelPlugin;