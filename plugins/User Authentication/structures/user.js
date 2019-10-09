const UserAuthentication = require("../Plugin.js");

class User {
    constructor(username, password, isAdmin, creationTime, ua) {
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
        this.creationTime = creationTime;

        /**
         * The user-authenticator plugin.
         * @type {UserAuthentication}
         */ 
        this.ua = ua;
    }

    /**
     * Whether or not the user in question is an Admin.
     * @returns {bool}
     */
    isAdmin() {
        return this.isAdmin; // Return whether or not they're an Admin.
    }

    /**
     * Sets the user's password.
     * @param {string} oldpass 
     * @param {string} newpass
     * @returns {void} 
     */
    changePassword(oldpass, newpass) {
        if (this.ua.encryptInput(oldpass) == this.password)
            this.ua.savePassword(this.ua.encryptInput(newpass));
        else
            console.log("User authentication error; password not the same.");
    }
}

module.exports = User;