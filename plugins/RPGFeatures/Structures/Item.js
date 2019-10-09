class Item {
    constructor() {
        /**
         * The item's ID.
         */
        this.id = 0;
        
        /**
         * The item's name.
         */
        this.name = "";

        /**
         * The item's price.
         */
        this.price = 0;

        /**
         * If this item can equipped.
         */
        this.equippable = false;

        /**
         * The slot this item equips to.
         */
        this.slot = 0;

        /**
         * Class restrictions.
         */
        this.classes = [];

        /**
         * Whether or not this item can be traded.
         */
        this.tradable = false;
    }
}

module.exports = Item;