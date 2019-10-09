class File {
    constructor(name, content, creationTime, permissions, fs) {
        this.name = name;
        this.content = content;
        this.creationTime = creationTime;
        this.permissions = permissions;
        this.fs = fs;
    }

    /**
     * Whether or not the current user can read the file.
     * @returns {Boolean}
     */
    canRead() {
        var user = this.fs.loggedInUser; // Get the logged in user.
        var isAdministrator = user.isAdmin(); // Get whether or not this user is an admin.

        // Check whether or not this kind of user can use it.
        if (isAdministrator) {
            var perms = this.fs.interpretPermissions(this.permissions); // Interpret the permissions from the file.

            if (perms[0] == 2 || perms[0] == 3)
                return true;

            return false;
        } else {
            var perms = this.fs.interpretPermissions(this.permissions); // Interpret the permissions from the file.

            if (perms[1] == 2 || perms[1] == 3)
                return true;

            return false;
        }

    }

    /**
     * Whether or not the current user can write to the file.
     * @returns {Boolean}
     */
    canWrite() {
        var user = this.fs.loggedInUser; // Get the logged in user.
        var isAdministrator = user.isAdmin(); // Get whether or not this user is an admin.

        // Check whether or not this kind of user can use it.
        if (isAdministrator) {
            var perms = this.fs.interpretPermissions(this.permissions); // Interpret the permissions from the file.

            if (perms[0] == 1 || perms[0] == 3)
                return true;

            return false;
        } else {
            var perms = this.fs.interpretPermissions(this.permissions); // Interpret the permissions from the file.

            if (perms[1] == 1 || perms[1] == 3)
                return true;

            return false;
        }

    }
}

module.exports = File;