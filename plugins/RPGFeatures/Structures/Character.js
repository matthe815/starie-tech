class Character {
    constructor(rpg, information) {
        
        this.rpg = rpg;

        if (!information) // Stop if there's no information.
            return;

        /**
         * The character's unique ID.
         */
        this.id = information.id;

        /**
         * The character's first name.
         */
        this.first_name = information.first_name;

        /**
         * The character's last name.
         */
        this.last_name = information.last_name;

        /**
         * The character's gender.
         */
        this.gender = information.gender;

        /**
         * The character's equipped class.
         */
        this.CurrentClassJob = JSON.parse(information.CurrentClassJob);

        /**
         * The character's classes.
         */
        this.Classes = JSON.parse(information.Classes);

        /**
         * The character's equipment.
         */
        this.Equipment = JSON.parse(information.Equipment);

        /**
         * The character's item inventory.
         */
        this.Items = JSON.parse(information.Items);

        /**
         * The character's owner.
         */
        this.Owner = information.Owner;
    }

    /**
     * Get a combined version of their first & last name.
     */
    get name() {
        return `${this.first_name} ${this.last_name}`;
    }

    /**
     * Get the combined strength.
     */
    get strength() {
        return this.rpg.classes.get(this.Classes[this.CurrentClassJob].ClassID).baseStrength[this.Classes[this.CurrentClassJob].Level-1]; // Get the strength from their class.
    }

    /**
     * Get the combined defense.
     */
    get defense() {
        return this.rpg.classes.get(this.Classes[this.CurrentClassJob].ClassID).baseDefense[this.Classes[this.CurrentClassJob].Level-1]; // Get the strength from their class.
    }

    /**
     * Get the combined mental.
     */
    get mental() {
        return this.rpg.classes.get(this.Classes[this.CurrentClassJob].ClassID).baseMental[this.Classes[this.CurrentClassJob].Level-1]; // Get the strength from their class.
    }
}

module.exports = Character;