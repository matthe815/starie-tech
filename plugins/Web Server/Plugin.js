const Plugin = require("../../plugin-manager/plugin.js");
const express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var _port = 1337;

class WebPanelPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: 'webserver',
            name: "Web Server",
            description: "A web server!",
            version: "1.0.0",
            author: "Matthe815"
        })

        this.SQLite;
        this.app = express();
        this.app.use(bodyParser.json()); // support json encoded bodies
        this.app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.app.use(cookieParser());
    }

    async load()
    {
        this.app.listen(_port);
        console.log(`Listening on ${_port}`);
    }
}

module.exports = WebPanelPlugin;