var Command = require("../../plugins/Command System/command-system/command");
const Character = require("../../plugins/RPGFeatures/Structures/Character");
const {RichEmbed} = require("discord.js");

class NewCharacterCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "new-character",
            memberName: "new-character",
            description: "Create a brand new character.",
            category: "RPG",
        })

        this.cs = cs;
        this.rpgModule = this.cs.manager.plugins.get("rpg-features");
    }

    async load(msg, args) {
        var rpgModule = this.cs.manager.plugins.get("rpg-features"); // Cache that.
        var embed = new RichEmbed(); // Create a new embed.
        embed.setAuthor(this.cs.manager.Translate({ message: "CHARACTER_GENERATOR", guild: msg.guild}), msg.author.displayAvatarURL); // Set the title & icon.
        embed.setDescription(this.cs.manager.Translate({ message: "CHARACTER_WELCOME", guild: msg.guild}));
        embed.addField("General Information", "1⃣ First Name\n2⃣ Last Name\n3⃣ Gender");
        embed.setFooter("When you're done, click ⏭!");
        embed.setTimestamp(new Date()); // Set the date.

        var mess = await msg.channel.send({embed}); // Send the embed.
        mess.react("1⃣"); // React with the stuff.
        mess.react("2⃣"); // React more.
        mess.react("3⃣"); // And more.
        mess.react("⏭"); // Done.

        var collector = mess.createReactionCollector((reaction, user) => (reaction.emoji.name === "1⃣" || reaction.emoji.name === "2⃣" || reaction.emoji.name === "3⃣" || reaction.emoji.name === "⏭") && user.id === msg.author.id, {time: 100000});
        
        var fname, lname, gender; // Placeholder variables.

        collector.on("end", (r) => {
            if (r == "time")
                return msg.reply("Character Creator timed out.");
        });

        collector.on("collect", (r) => {
            switch (r.emoji.name) {
                case "⏭":
                    collector.stop(); // Stop the collector.

                    if (rpgModule.characters.has(`${fname} ${lname}`)) // Verify that that name doesn't exist.
                        return msg.reply("That name is already in use!");

                    rpgModule.SQLite.dbPromise.run("INSERT INTO characters(first_name, last_name, gender, Owner) VALUES(?, ?, ?, ?)", fname, lname, gender, msg.author.id); // Set that too.
                    rpgModule.characters.set(`${fname} ${lname}`, new Character({first_name: fname, last_name: lname, gender, CurrentClassJob: {"ClassID": 0, "Level": 1}, Classes: {"0" :{"ClassID": 0, "Level": 1}}})); // Set the new character.
                    rpgModule.characterOwners.set(msg.author.id, `${fname} ${lname}`); // Set that too.

                    msg.reply("Character successfully saved."); // Saved!
                break;

                case "1⃣":
                    msg.reply("What would you like your first name to be? (Must be less than 8 characters)"); // Ask for the name.
                    var mcollector = msg.channel.createMessageCollector((ms) => ms.author.id == msg.author.id);  // Only respond if it's the user.

                    mcollector.on("collect", (m) => {
                        if (m.length >= 8) // Stop if the name is too long.
                            return msg.reply("Invalid name length.");

                        fname = m.content; // Set the name.

                        var em = embed; // Create a new RE for sending.
                        em.fields[0].value = `1⃣ First Name: ${fname}\n2⃣ Last Name: ${lname}\n3⃣ Gender: ${gender}`; // Set the value.
                        mess.edit({em}); // Edit the new embed in.
                        msg.reply(`Name successfully set to ${fname}`); // Do the thing.
                        mcollector.stop(); // End the collector.
                    })
                break;
                
                case "2⃣":
                    msg.reply("What would you like your last name to be? (Must be less than 8 characters)"); // Ask for the name.
                    var mcollector = msg.channel.createMessageCollector((ms) => ms.author.id == msg.author.id);  // Only respond if it's the user.
                
                    mcollector.on("collect", (m) => {
                        if (m.length >= 8) // Stop if the name is too long.
                            return msg.reply("Invalid name length.");

                        lname = m.content; // Set the name.

                        var em = embed; // Create a new RE for sending.
                        em.fields[0].value = `1⃣ First Name: ${fname}\n2⃣ Last Name: ${lname}\n3⃣ Gender: ${gender}`; // Set the value.
                        mess.edit({em}); // Edit the new embed in.
                        msg.reply(`Last Name successfully set to ${lname}`); // Do the thing.
                        mcollector.stop(); // End the collector.
                    });        
                break;

                case "3⃣":
                    msg.reply("What would you like your gender to be? (1 = male, 2 = female)"); // Ask for the name.
                    var mcollector = msg.channel.createMessageCollector((ms) => ms.author.id == msg.author.id);  // Only respond if it's the user.
                
                    mcollector.on("collect", (m) => {
                        if (m.content != "1" && m.content != "2") // Verify the gender.
                            return msg.reply("Invalid gender.");

                        gender = m.content == 1 ? "Male" : "Female"; // Set the gender.

                        var em = embed; // Create a new RE for sending.
                        em.fields[0].value = `1⃣ First Name: ${fname}\n2⃣ Last Name: ${lname}\n3⃣ Gender: ${gender}`; // Set the value.
                        mess.edit({em}); // New embed.
                        msg.reply(`Gender successfully set to ${gender}`); // Do the thing.
                        mcollector.stop(); // End the collector.
                    });
                break;
            }
        });
    }
}

module.exports = NewCharacterCommand;