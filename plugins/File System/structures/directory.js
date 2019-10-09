class Directory {
    constructor(name, files, creationDate, fs) {
        this.name = name;
        this.files = files;
        this.creationDate = creationDate;
        this.fs = fs;
    }
}

module.exports = Directory;