const Class = require("../Structures/Class");

class Class2 extends Class {
    constructor() {
        super(); // Initalize the inherited class.

        this.id = 2;
        this.name = "Medic";
        this.baseStrength = [1, 1, 2, 4, 5, 7, 9, 10, 12, 14];
        this.baseDefense = [4, 6, 6, 7, 8, 10, 12, 13, 14, 15];
        this.baseMental = [4, 5, 7, 8, 10, 12, 14, 17, 20, 24];
    }
}

module.exports = Class2;