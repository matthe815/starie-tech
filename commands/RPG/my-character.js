var Command = require("../../plugins/Command System/command-system/command");
const Character = require("../../plugins/RPGFeatures/Structures/Character");
const {RichEmbed} = require("discord.js");

class MyCharacterCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "my-character",
            memberName: "my-character",
            description: "See your character.",
            category: "RPG",
        })

        this.cs = cs;
        this.rpgModule = this.cs.manager.plugins.get("rpg-features");
    }

    load(msg, args) {
        var character = this.rpgModule.characters.get(this.rpgModule.characterOwners.get(msg.author.id)); // Get the character.
        var embed = new RichEmbed(); // New RE.
        var classId = character.CurrentClassJob; // Get their class.

        embed.setTitle(`${character.name} ${character.gender === "Male" ? "♂" : "♀"}`); // Set the title to the name.
        embed.addField("Owner", this.client.users.get(character.Owner), true); // The owner.
        embed.addField("Class", `${this.rpgModule.classes.get(character.Classes[classId].ClassID).name} ${character.Classes[classId].Level}`, true); // Get their class.
        
        var Classes = []; // Classes.

        // Get all of the Classes.
        for (var Class in character.Classes) {
            if (character.Classes[Class].Level != 0)
                Classes.push(`${this.rpgModule.classes.get(character.Classes[Class].ClassID).name} ${character.Classes[Class].Level}`);
        }
        
        embed.addField("Classes", Classes.join("\n")); // The player's classes.
        embed.setFooter(`Strength / Defense / Mental | ${character.strength} / ${character.defense} / ${character.mental}`); // Set the footer.
        embed.setTimestamp(new Date()); // Get a new date.

        msg.channel.send({ embed }); // Send it.
    }
}

module.exports = MyCharacterCommand;