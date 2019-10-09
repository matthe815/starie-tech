class Class {
    constructor() {
        /**
         * The class's ID.
         */
        this.id = 0;
        
        /**
         * The class's name.
         */
        this.name = "";

        /**
         * The strength curve for the class.
         */
        this.baseStrength = [];

        /**
         * The defense curve for the class.
         */
        this.baseDefense = [];

        /**
         * The mental curve for the class.
         */
        this.baseMental = [];
    }
}

module.exports = Class;