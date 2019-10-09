var Command = require("../../plugins/Command System/command-system/command");
var {RichEmbed} = require("discord.js");

class PingCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "joindate",
            memberName: "joindate",
            description: "Yes",
            category: "General Commands"
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        msg.channel.send(new Date(this.client.users.get(args[0]).createdTimestamp).toDateString());
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

module.exports = PingCommand;