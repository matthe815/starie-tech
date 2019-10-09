const Plugin = require("../../plugin-manager/plugin");
const { Collection, RichEmbed } = require("discord.js");

class StarManagement extends Plugin {
    constructor(manager)
    {
        super(manager, {
            id: "star-management",
            name: "Star Management",
            description: "Keep track of stars, and manage new stars",
            author: ["Matthe815"],
            version: "1.0.0"
        })

        this.stars = new Collection(); // A cached star collection.
        this.SQLite = null; 
    }

    load() {
        this.SQLite = this.manager.plugins.get("SQLite"); // Get the SQLite plugin.

        this.manager.client.guilds.forEach(async (guild) => {
            var guildData = await this.SQLite.get("guild_settings", "guild_id", guild.id); // Get the guild data.

            if (!guildData) // If there's no guild data, quickly generate some for this guild.
                return this.GenerateGuildData(guild);

            guild.prefix = guildData.prefix; // The data.
            guild.star_threshold = guildData.star_threshold; // Set the Star_Threshold Property.
            guild.star_channel = guildData.star_channel; // Set the Star_Channel property.
        });

        this.manager.client.on("messageReactionAdd", (reaction, user) => {
            if (reaction.message.author == user) // If the person who added the star is the message sender, ignore it.
                return;

            this.AddStar(reaction, user); // Add a star.
        });
    }

    /**
     * Register a star for a message.
     */ 
    AddStar(reaction, user) {
        if (reaction.emoji != "⭐") // Stop if it's not a star.
            return;
            
        if (this.stars.has(reaction.message.id) && this.stars.get(reaction.message.id).users.includes(user.id)) // Prevent abuse by not doing it a second time.
            return;
        
        if (reaction.count >= reaction.message.guild.star_threshold) // If the reaction count is over the threshold.
        {
            if (this.stars.has(reaction.message.id) && !this.stars.get(reaction.message.id).users.includes(user.id)) { // If the user isn't in there, push it.
                this.stars.get(reaction.message.id).users.push(user.id);
                this.stars.get(reaction.message.id).count+=1;
                this.PostStarMessage(reaction, user); // Post a star message.
            } else if (!this.stars.has(reaction.message.id)) {
                this.PostStarMessage(reaction, user); // Post a star message.
            }
        }
    }

    /**
     * Post a star message.
     */
    async PostStarMessage(reaction, user) {
        var embed = new RichEmbed(); // Create a new rich embed.
        embed.setAuthor(reaction.message.author.tag, reaction.message.author.avatarURL); // Set the author to the message author.
        embed.setDescription(reaction.message.content); // Set the description to the content.
        embed.setFooter(`⭐${this.stars.has(reaction.message.id) ? this.stars.get(reaction.message.id).count : 1}`); // Add the number of stars.
        embed.setColor("RANDOM"); // Set to a random color.
        embed.addField("Channel", reaction.message.channel); // Set the channel info.
        embed.addField("Starred At", new Date()); // Set the time.

        if (reaction.message.attachments.size > 0) // Attach any images.
            embed.setImage(reaction.message.attachments.first().url);

        embed.setTimestamp(reaction.message.createdAt); // Set the timestamp to the message's timestamp.

        if (!this.stars.has(reaction.message.id))
        {
            var message = await reaction.message.guild.channels.get(reaction.message.guild.star_channel).send(embed); // Send the newly generated embed.
            this.stars.set(reaction.message.id, { count: 1, users: reaction.users.array(), message }); // Set an editable instance.
        } else {
            this.stars.get(reaction.message.id).message.edit(embed); // Edit the embed.
        }
    }

    // Generate a guild's data.
    GenerateGuildData(guild) {
        this.SQLite.insert("guild_settings", ["guild_id", "star_threshold", "star_channel"], [guild.id, 3, null]); // Insert the new settings into the guild_settings.
    }
}

module.exports = StarManagement;