const Plugin = require("../../plugin-manager/plugin.js");
const fs = require('fs');
const crypto = require('crypto');

class FileSystemPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "file-system",
            name: "File System Management",
            description: "Manage the internal file system",
            version: "1.0a",
            author: ["Matthe815"]
        });

        this.loggedInUser;
    }

    preLoad() {

    }

    load() {
        
    }

    interpretPermissions(number) {
        var permissions = number.toString().split("").slice(0, 1); // Divide the number into a readable format.
        
        if (permissions[0] > 3) permissions[0] = 3; // Clamp the permissions to a maximum of 3.
        if (permissions[1] > 3) permissions[1] = 3; // Clamp the permissions to a maximum of 3.

        return permissions;
    }
}

module.exports = FileSystemPlugin;