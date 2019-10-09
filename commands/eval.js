var Command = require("../plugins/command-system/command");
var util = require('util');
const escapeRegex = require('escape-string-regexp');
var manager = null;

class EvalCommand extends Command {
    constructor(client, cs) {
        super(client, {
            name: "eval",
            memberName: "eval",
            description: "Evaluate arbitrary code.",
            category: "Bot Administration",
            permissionLevel: 4
        })

        this.cs = cs;
        this.manager = cs.manager;
    }

    async load(msg, args) {
        var client = this.client;
        var message = msg;
        var mess = await msg.reply("Executing code...");
        var hrtime = process.hrtime();

        try {
        var processed = this.processMessage(eval(args.join(" ")));
        } catch (e) {
            console.error(e);
            msg.channel.send(`An error has occured whilst evaluating that code: ${e}`);
        }

        var time = process.hrtime(hrtime)[1] / 1000000;

        if (processed) { mess.edit(`**Took ${time}ms to process**\n\n**INPUT:**\n\`\`\`js\n${args.join(" ")}\`\`\`\n**OUTPUT:**\n\`\`\`js\n${processed}\`\`\``); } else { mess.edit(`**INPUT:**\n\`\`\`${args[0]}\`\`\`\n**OUTPUT:**\n\`\`\`undefined\`\`\``); }
    }

    processMessage(result) {
        const inspected = util.inspect(result, { depth: 0 })
        .replace(this.sensitivePattern, '--snip--');
    const split = inspected.split('\n');
    const last = inspected.length - 1;
    const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0];
    const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
        split[split.length - 1] :
        inspected[last];
    const prepend = `\`\`\`javascript\n${prependPart}\n`;
    const append = `\n${appendPart}\n\`\`\``;

    return inspected;
    }

    get sensitivePattern() {
		if(!this._sensitivePattern) {
			const client = this.client;
			let pattern = '';
			if(client.token) pattern += escapeRegex(client.token);
			if(client.email) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.email);
			if(client.password) pattern += (pattern.length > 0 ? '|' : '') + escapeRegex(client.password);
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi') });
		}
		return this._sensitivePattern;
	}
}

module.exports = EvalCommand;