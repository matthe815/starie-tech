var Command = require("../../plugins/Command System/command-system/command");
const Character = require("../../plugins/RPGFeatures/Structures/Character");
const {RichEmbed} = require("discord.js");

class MyCharacterCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "character",
            memberName: "character",
            description: "See other peoples' character.",
            category: "RPG",
        })

        this.cs = cs;
        this.rpgModule = this.cs.manager.plugins.get("rpg-features");
    }

    load(msg, args) {
        var character = this.rpgModule.characters.get(this.rpgModule.characterOwners.get(parse(args[0], msg).id)); // Get the character.
        var embed = new RichEmbed(); // New RE.

        embed.setTitle(`${character.name} ${character.gender === "Male" ? "♂" : "♀"}`); // Set the title to the name.
        embed.addField(this.cs.manager.Translate({ message: "OWNER", guild: msg.guild}), this.client.users.get(character.Owner), true); // The owner.
        embed.addField(this.cs.manager.Translate({ message: "CLASS", guild: msg.guild}), `${this.rpgModule.classes.get(character.Classes[character.CurrentClassJob].ClassID).name} ${character.Classes[character.CurrentClassJob].Level}`, true); // Get their class.
        
        console.log(embed);
        
        var Classes = []; // Classes.

        // Get all of the Classes.
        for (var Class in character.Classes) {
            if (character.Classes[Class].Level != 0)
                Classes.push(`${this.rpgModule.classes.get(character.Classes[Class].ClassID).name} ${character.Classes[Class].Level}`);
        }
        
        embed.addField(this.cs.manager.Translate({ message: "CLASSES", guild: msg.guild}), Classes.join("\n")); // The player's classes.
        embed.setFooter(`Strength / Defense / Mental | ${character.strength} / ${character.defense} / ${character.mental}`); // Set the footer.
        embed.setTimestamp(new Date()); // Get a new date.

        msg.channel.send({ embed }); // Send it.
    }
}

function parse(value, msg) {
    const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
    if(matches) return msg.client.users.get(matches[1]) || null;
    if(!msg.guild) return null;
    const search = value.toLowerCase();
    const members = msg.guild.members.filterArray(memberFilterInexact(search));
    if(members.length === 0) return null;
    if(members.length === 1) return members[0].user;
    const exactMembers = members.filter(memberFilterExact(search));
    if(exactMembers.length === 1) return members[0].user;
    return null;
}

function memberFilterExact(search) {
	return mem => mem.user.username.toLowerCase() === search ||
		(mem.nickname && mem.nickname.toLowerCase() === search) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search) {
	return mem => mem.user.username.toLowerCase().includes(search) ||
		(mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}


module.exports = MyCharacterCommand;