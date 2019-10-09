var Command = require("../plugins/command-system/command");

class GetRoleCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "Get Role",
            memberName: "getrole",
            description: "Get the role of a user.",
            category: "Bot Administration"
        });

        this.cs = cs;
    }

    async load(message, args) {
        var user = parse(args.join(" "), message);

        if (!user) return message.channel.send(`Invalid user provided.`)

        var role = this.cs.levels.get(parseInt(await this.cs.getUserLevel(user.id))).name;
        message.channel.send(`\`${user.tag}\`'s role is: \`${role}\``);
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

module.exports = GetRoleCommand;