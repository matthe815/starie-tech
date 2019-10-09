const Item = require("../Structures/Item");

class Item1 extends Item {
    constructor() {
        super();

        this.id = 1;
        this.name = "Iron Sword";
        this.equippable = true;
        this.slot = 1;
        this.price = 250;
        this.tradable = true;
        this.classes = [0, 1];
    }
}

module.exports = Item1;