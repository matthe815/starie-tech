const Class = require("../Structures/Class");

class Class0 extends Class {
    constructor() {
        super(); // Initalize the inherited class.

        this.id = 0;
        this.name = "Drifter";
        this.baseStrength = [2, 2, 5, 8, 15, 16, 16, 18, 20, 32];
        this.baseDefense = [2, 4, 7, 12, 16, 17, 20, 23, 26, 30];
        this.baseMental = [2, 3, 4, 6, 8, 10, 12, 14, 14, 16];
    }
}

module.exports = Class0;