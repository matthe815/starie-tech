const Class = require("../Structures/Class");

class Class1 extends Class {
    constructor() {
        super(); // Initalize the inherited class.

        this.id = 1;
        this.name = "Knight";
        this.baseStrength = [5, 6, 8, 10, 15, 17, 20, 24, 29, 34];
        this.baseDefense = [10, 14, 16, 17, 20, 25, 27, 30, 37, 46];
        this.baseMental = [1, 1, 1, 1, 2, 3, 4, 5, 6, 7];
    }
}

module.exports = Class1;