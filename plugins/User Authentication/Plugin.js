const Plugin = require("../../plugin-manager/plugin.js");
const fs = require('fs');
const crypto = require('crypto');
const User = require("./structures/user");

class UserAuthenticationPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: "user-auth",
            name: "User Authentication",
            description: "Authentiate the user owners",
            version: "1.0a",
            author: ["Matthe815"]
        });

        this.loggedInUser = new User("guest", null, false, new Date().getTime(), this);

        try {
            this.userPasswds = JSON.parse(fs.readFileSync(__dirname + "/passwds/ownerlock.lck")); // Get the user password information.
        } catch (e) {
            console.log("Defaulting to null");
            this.userPasswds = null // Get the user password information.
        }
    }

    load() {
        var MyInterface = this.manager.plugins.get("my-interface");
        MyInterface.register(new PasswdCommand(this.manager, this.MyInterface));
        var pw = this.encryptInput("admin");

        if (this.userPasswds == null) // If there's no accounts, set up an ADMIN account.
            this.newAccount("admin", pw, true);

        console.log("User Authentication loaded");
        console.log(`Owner Lock File: ${this.userPasswds}`);
    }

    /**
     * Return the logged in user.
     * @returns {User}
     */
    getUser() {
        return this.loggedInUser;
    }

    /**
     * Save the password to the OWNERLOCK.
     * @param {User} user 
     * @param {string} newhash 
     */
    savePassword(user, newhash) {
        if (this.userPasswds == null) // If there's no user passwds.
            this.userPasswds = {}; // Default to {}.

        this.userPasswds[user] = newhash; // Write the new password to the JSON.
        var passwds = JSON.stringify(this.userPasswds); // Convert it to a JSON string.
        fs.writeFileSync(__dirname + "/passwds/ownerlock.lck", passwds); // Write an encrypted form to the file.
    }

    /**
     * Encrypts the provided input and returns it.
     * @param {string} password The password to encrypt.
     * @returns {string}
     */
    encryptInput(password) {
        var hash = crypto.createHash('sha256'); // Create a new hash.
        hash.update(password); // Update the hash.
        var hr = hash.digest('hex');
        return hr; // Return the hash.
    }

    /**
     * Create a brand new user account.
     * @param {string} username The user's username.
     * @param {string} password The user's HASHED password.
     * @param {Boolean} isAdmin Whether or not the user is an admin.
     * @returns {void} 
     */
    newAccount(username, password, isAdmin=false) {
        console.log(`User account created; ${username} created as ${isAdmin ? "an Administrator" : "a user"}.`);
        this.savePassword(username, password); // Save the password to the OWNERLOCK.
    }
}

class LoginCommand {
    constructor(manager, ie) {
        this.manager = manager;
        this.name = "passwd";
        this.ie = ie;
    }

    response(args) {
        if (matchPassword(args[0], this.encryptInput(args.slice(1).join(" "))))
            this.loggedInUser = new User(args[0], this.encryptInput(args.slice(1).join(" ")));
    }
}

class PasswdCommand {
    constructor(manager, ie) {
        this.manager = manager;
        this.name = "passwd";
        this.ie = ie;
    }

    response(args) {
        this.manager.plugins.get("user-auth").savePassword(args[0], args.slice(1).join(""));
        console.log("Successfully registered new password");
    }
}

module.exports = UserAuthenticationPlugin;