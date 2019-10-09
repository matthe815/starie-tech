var Command = require("../plugins/command-system/command");

class ChangeRoleCommand extends Command {
    constructor(client, cs)
    {
        super(client, {
            name: "Change Role",
            memberName: "changerole",
            description: "Change the role of a user.",
            category: "Bot Administration",
            permissionLevel: 3
        });

        this.cs = cs;
    }

    async load(msg, args)
    {
        var tc = parse(args[0], msg);
        args = args.slice(1);
        
        if (!tc) return msg.edit(`Invalid user provided.`);

        if (msg.author.id == tc.id && !this.cs.isOwner(msg.author)) return msg.channel.send(`You *probably* don't want to edit your own permissions.`)

        var role = parseRole(args.join(" ").trim(), this.cs);

        var role = await this.cs.updateRole(msg.author, tc.id, role);

        if (role == "no_permission") return msg.channel.send(`You don't have permission to move ${tc.tag} to this level.`);
        if (role == "no_permission_user") return msg.channel.send(`You don't have permission to manage ${tc.tag}'s permission level.`);
        if (role == "no_role") return msg.channel.send(`The role \`${args.join(" ").trim()}\` does not exist!`);

        return msg.channel.send(`Successfully updated \`${tc.tag}\`'s User Level to \`${this.cs.levels.get(role).name}\`!`);
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

function parseRole(value, cs) {
    const search = value.toLowerCase();
    const members = cs.levels.filterArray(roleFilterInexact(search));
    if(members.length === 0) return null;
    if(members.length === 1) return members[0].level;
    const exactMembers = members.filter(roleFilterExact(search));
    if(exactMembers.length === 1) return members[0].level;
    return 0;
}

function roleFilterExact(search) {
	return role => role.level === parseInt(search) || role.name.toLowerCase() === search;
}

function roleFilterInexact(search) {
	return role => role.level === parseInt(search) || role.name.toLowerCase().includes(search);
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

module.exports = ChangeRoleCommand;