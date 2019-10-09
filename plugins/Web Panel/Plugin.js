const Plugin = require("../../plugin-manager/plugin.js"),
      request = require("request"),
      Discord = require("discord.js");

const CLIENT_SECRET = "yky-pvIeZv9xK8Kdi-Pwaa7s1eCczMqZ", 
      CLIENT_ID = "369490199589158912";

class WebPanelPlugin extends Plugin {
    constructor(manager) {
        super(manager, {
            id: 'webpanel',
            name: "Web Panel",
            description: "A web panel!",
            version: "1.0.0",
            author: "Matthe815"
        })

        this.SQLite;
    }

    async load()
    {
        var client = this.manager.client; // Get the client.
        var app = this.manager.plugins.get("webserver").app; // Get the web app.
        this.SQLite = this.manager.plugins.get("SQLite"); // Get the SQLite plugin.

        var db = this.SQLite.dbPromise; /* Get the DB. */
        
        client.on("guildMemberAdd", (member) => {
            db.run(`INSERT INTO join_leaves(type, userId, guildId, time) VALUES(0, "${member.id}", "${member.guild.id}", ${new Date().getTime()})`);
            client.guilds.get(member.guild.id).joins++;
        });

        client.on("guildMemberRemove", (member) => {
            db.run(`INSERT INTO join_leaves(type, userId, guildId, time) VALUES(1, "${member.id}", "${member.guild.id}", ${new Date().getTime()})`);
            client.guilds.get(member.guild.id).leaves++;
        });

        db.each("SELECT * FROM join_leaves", (err, row) => {
            switch (row.type) {
                default:
                case 0:
                    if (client.guilds.get(row.guildId).joins == undefined)
                        client.guilds.get(row.guildId).joins = 0;

                    client.guilds.get(row.guildId).joins++;
                break;
                case 1:
                    if (client.guilds.get(row.guildId).leaves == undefined)
                        client.guilds.get(row.guildId).leaves = 0;

                    client.guilds.get(row.guildId).leaves++;
                break;
            }
        });

        client.guilds.forEach((guild) => {
            if (guild.webRoles == undefined)
                guild.webRoles = new Discord.Collection();

            if (guild.authorized_users == undefined)
                guild.authorized_users = new Discord.Collection();
        });

        db.each(`SELECT * FROM \`webpanel_roles\``, (err, row) => {
            var guild = client.guilds.get(row.guildId); // The guild.

            guild.webRoles.set(row.roleId, row);
        });

        db.each(`SELECT * FROM \`webpanel_auth\``, (err, row) => {
            var guild = client.guilds.get(row.guildId); // The guild.

            guild.authorized_users.set(row.userId, {user: row.userId, role: row.roleId, authUserId: row.authUserId});
            console.log(guild.authorized_users);
        });

        app.get('/', (req, res) => {
            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.cookies.token], (err, row) => {
                if (err)
                    return;
                
                if (row)
                    res.sendFile(`${__dirname}/pages/home.html`); // Send the home page.
                else
                    res.sendFile(`${__dirname}/pages/login.html`); // Send the home page.
            });
        });

        app.get('/login', (req, res) => {
            res.sendFile(`${__dirname}/pages/login.html`);
        });

        app.get('/oauth', (req, res) => {
            var oauth_code = req.query.code, token = Math.floor(Math.random());
            console.log(oauth_code);

            request.post("https://discordapp.com/api/oauth2/token", {formData: {
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'grant_type': 'authorization_code',
                'code': oauth_code,
                'redirect_uri': "http://localhost:1337/oauth",
                'scope': 'identify guilds'
              }}, (err, req, body) => {
                var oauth = JSON.parse(body);

                request.get("https://discordapp.com/api/users/@me", (err, req, body) => {
                    var user = JSON.parse(body);    

                    console.log(oauth);

                    db.run(`INSERT INTO oauth_users(token, refresh_token, oauth_token, refresh_time, userId) VALUES(?,?,?,?,?)`, [token, oauth.refresh_token, oauth.access_token, new Date().getTime() + oauth.expires_in, user.id], (err, row) => {
                        if (err)
                            return;

                    });
                }).auth(null, null, true, oauth.access_token);
            });

            res.cookie("token", token);
            res.redirect("/");
        });

        app.get('/manage/:guildId', (req, res) => {
            res.sendFile(`${__dirname}/pages/manage.html`, {}); // Send the home page.
        });

        app.get('/manage/:guildId/members', (req, res) => {
            res.sendFile(`${__dirname}/pages/members.html`, {}); // Send the home page.
        });

        app.get('/manage/:guildId/permissions', (req, res) => {
            res.sendFile(`${__dirname}/pages/permissions.html`, {}); // Send the home page.
        });

        app.get('/manage/:guildId/settings', (req, res) => {
            res.sendFile(`${__dirname}/pages/settings.html`, {}); // Send the home page.
        });

        app.get('/manage/:guildId/roles', (req, res) => {
            res.sendFile(`${__dirname}/pages/roles.html`, {}); // Send the home page.
        });

        app.get('/manage/:guildId/managers', (req, res) => {
            res.sendFile(`${__dirname}/pages/managers.html`, {}); // Send the home page.
        });

        app.post("/oauth/user", (req, res) => {
            if (!req.cookies.token)
                res.send({"statusCode": 400, "content": "Unauthorized"});

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.cookies.token], (err, row) => {
                if (err)
                    return;

                console.log(row);


                request.get("https://discordapp.com/api/users/@me", (err, req, body) => {
                    res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.
                    res.send(JSON.parse(body)); // Send all of the guilds.
                }).auth(null, null, true, row.oauth_token);
            });     
        });

        app.post('/guilds', (req, res) => {
            if (!req.body.token)
                res.send({"statusCode": 400, "content": "Unauthorized"});

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return;

                res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.
                res.send(client.guilds.filter((guild) => guild.owner.id === row.userId || guild.authorized_users.has(row.userId)).array()); // Send all of the guilds.
            });
        });
        
        app.get('/guild/:guildId', async (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.
            var guild = client.guilds.get(req.params.guildId); // The guild.
            guild.roleCount = guild.roles.size; // Get the role count.
            guild.channelCount = guild.channels.size; // Get the channel size.
            guild.canEditRoles = guild.me.hasPermission("MANAGE_ROLES"); // See if I can manage roles.

            res.send(guild); // Send all of the guilds.
        });

        app.get('/guild/:guildId/members', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.cookies.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    db.get(`SELECT * FROM \`webpanel_auth\` WHERE \`userId\`= ? AND \`guildId\`= ?`, [row.userId, req.params.guildId], (err, row2) => {
                        var guild = client.guilds.get(req.params.guildId); // The guild.
                        var members = [];

                        if (!row2 && guild.owner.id != row.userId)
                            return res.send({"statusCode": 400, "content": "Unauthorized"});

                        guild.members.forEach((member) => {
                            members.push({id: member.id, nickname: member.nickname, tag: member.user.tag, discriminator: member.user.discriminator, username: member.user.username, avatar: member.user.avatar || member.user.discriminator % 5, isAdministrator: member.hasPermission("ADMINISTRATOR"), isStaff: member.hasPermission("MANAGE_MESSAGES")});
                        });
                
                        res.send(members); // Send all of the guilds.
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.get('/guild/:guildId/managers', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.cookies.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    db.get(`SELECT * FROM \`webpanel_auth\` WHERE \`userId\`= ? AND \`guildId\`= ?`, [row.userId, req.params.guildId], (err, row2) => {
                        db.all(`SELECT \`user_id\` FROM \`panel_managers\` WHERE \`guild_id\` = ?`, [req.params.guildId], (err, row3) => {
                            var managers = [];
                            2
                            row3.forEach((user) => {
                                managers.push(client.users.get(user.user_id));
                            });

                            res.send(managers);
                        });
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/permissions', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    db.get(`SELECT * FROM \`webpanel_auth\` WHERE \`userId\`= ? AND \`guildId\`= ?`, [row.userId, req.params.guildId], (err, row2) => {
                        var guild = client.guilds.get(req.params.guildId); // The guild.
                        var users = [];

                        users.push({ user: guild.owner.user, role: 0, authorizer: -1, editable: false })

                        guild.authorized_users.forEach((a_user) => {
                            var member = guild.members.get(a_user.user);
                            users.push({ user: {username: member.user.username, tag: member.user.tag, discriminator: member.user.discriminator, id: member.user.id, avatar: member.user.avatar ? member.user.avatar : member.user.discriminator % 5}, role: guild.webRoles.get(parseInt(a_user.role)), authorizer: client.users.get(a_user.authUserId), editable: row2 ? guild.webRoles.get(row2.roleId).position < guild.webRoles.get(parseInt(a_user.role)).position : true });
                        });

                        res.send(users); // Send all of the guilds.
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/permissions/add', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            if (!req.body.user)
                return res.send({"statusCode": 401, "content": "Bad request"});
                
            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    var guild = client.guilds.get(req.params.guildId);

                    console.log([req.body.user, guild.webRoles.last().id, row.userId, guild.id]);
                    db.run(`INSERT INTO \`webpanel_auth\`(userId, roleId, authUserId, guildId) VALUES(?,?,?,?)`, [req.body.user, -1, row.userId, guild.id], (err, row2) => {
                        guild.authorized_users.set(req.body.user, {user: req.body.user, role: -1, authUserId: row.userId});
                        return res.send({"statusCode": 0, "content": "User successfully authorized"});
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/webRoles/add', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            if (!req.body.name)
                return res.send({"statusCode": 401, "content": "Bad request"});
                
            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return res.send(err);
                
                if (row) {
                    var guild = client.guilds.get(req.params.guildId), id=Math.floor(Math.random() * 25556000)*2;

                    db.run(`INSERT INTO \`webpanel_roles\`(name, roleId, creatorId, permissions, lastModified, guildId) VALUES(?,?,?,?,?,?)`, [req.body.name, id, row.userId, JSON.stringify([]), new Date().getTime(), guild.id], (err, row2) => {
                        guild.webRoles.set(String(id), {name: req.body.name, lastModified: new Date().getTime(), guildId: guild.id, roleId: id});
                        return res.send({"statusCode": 0, "content": "Role created"});
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/webRoles/remove', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            if (!req.body.id)
                return res.send({"statusCode": 401, "content": "Bad request"});
                
            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return res.send(err);
                
                if (row) {
                    var guild = client.guilds.get(req.params.guildId);

                    db.run(`DELETE FROM \`webpanel_roles\` WHERE \`roleId\`=?`, [req.body.id], (err, row2) => {
                        guild.webRoles.delete(req.body.id);
                        return res.send({"statusCode": 0, "content": "Role deleted"});
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/permissions/remove', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            if (!req.body.user)
                return res.send({"statusCode": 401, "content": "Bad request"});
                
            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    var guild = client.guilds.get(req.params.guildId);

                    console.log([req.body.user, guild.webRoles.last().id, row.userId, guild.id]);
                    db.run(`DELETE FROM \`webpanel_auth\` WHERE \`userId\`=?`, [req.body.user], (err, row2) => {
                        guild.authorized_users.delete(req.body.user);
                        return res.send({"statusCode": 0, "content": "User successfully unauthorized"});
                    });
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/webRoles', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    var guild = client.guilds.get(req.params.guildId);
                    res.send(guild.webRoles.array());
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.post('/guild/:guildId/members/search', (req, res) => {
            if (req.body.username.length < 3)
                return res.send({"statusCode": 400, "content": "Too short"});

            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.

            db.get(`SELECT * FROM \`oauth_users\` WHERE \`token\`= ?`, [req.body.token], (err, row) => {
                if (err)
                    return;
                
                if (row) {
                    var guild = client.guilds.get(req.params.guildId), toSend = [];
                    guild.members.filter((mem) => (mem.user.username.toLowerCase().includes(req.body.username.toLowerCase()) || mem.displayName.toLowerCase().includes(req.body.username.toLowerCase())) && !guild.authorized_users.has(mem.id) && guild.owner != mem).forEach((member) => {
                        toSend.push({user: {username: member.user.username, tag: member.user.tag, discriminator: member.user.discriminator, id: member.user.id, avatar: member.user.avatar ? member.user.avatar : member.user.discriminator % 5}});
                    });
                    
                    res.send(toSend);
                }
                else
                    res.send({"statusCode": 400, "content": "Unauthorized"});
            });
        });

        app.get('/guild/:guildId/roles', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // The guild.
            var roles = []; // The guild roles.

            // Push the roles.
            guild.roles.sort((b, a) => { if (b.position < a.position) return 1; if (b.position > a.position) return -1; if (b.position == a.position) return 0; }).filter((r) => r.name != "@everyone" && r.editable).forEach((role) => {
                roles.push({name: role.name, editable: role.editable, position: role.position, color: role.hexColor, id: role.id});
            });

            res.send(roles); // Send the roles.
        });

        app.delete('/guild/:guildId/managers/:userId', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // The guild.
            var roles = []; // The guild roles.

            db.run("DELETE FROM `panel_managers` WHERE `user_id`=? AND `guild_id`=?", [req.params.userId, req.params.guildId]);

            res.send({"message": "created"});
        });

        app.put('/guild/:guildId/managers/:userId', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // The guild.
            var roles = []; // The guild roles.

            db.run("INSERT INTO `panel_managers`(user_id, guild_id) VALUES (?, ?)", [req.params.userId, req.params.guildId]);

            res.send({"message": "created"});
        });
        
        app.get('/guild/:guildId/:userId/addrole/:roleId', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            var user = guild.members.get(req.params.userId); // Get the member.

            user.addRole(req.params.roleId).then((role) => {
                res.send({"statusCode": 0, "content": "Role successfully added."}); // Say that the role was added.
            }).catch((e) => {
                res.send({"statusCode": 500, "content": e}); // Say that the role wasn't added.
            }); // Add the role to the user.

        });

        app.post('/guild/:guildId/prefix/:prefix', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            guild.prefix = req.params.prefix; // The new prefix.

            res.send({"statusCode": 0, "content": "Prefix successfully added."}); // Say that the role was added.
        });

        app.post('/guild/:guildId/:userId/nickname/:nickname', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            var user = guild.members.get(req.params.userId); // Get the member.

            user.setNickname(req.params.nickname).then((role) => {
                res.send({"statusCode": 0, "content": "Nickname successfully changed."}); // Say that the role was added.
            }).catch((e) => {
                res.send({"statusCode": 500, "content": e}); // Say that the role wasn't added.
            }); // Add the role to the user.

        });

        app.get('/guild/:guildId/:userId/removerole/:roleId', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            var user = guild.members.get(req.params.userId); // Get the member.

            user.removeRole(req.params.roleId).then((role) => {
                res.send({"statusCode": 0, "content": "Role successfully removed."}); // Say that the role was added.
            }).catch((e) => {
                res.send({"statusCode": 500, "content": e}); // Say that the role wasn't added.
            }); // Add the role to the user.

        });

        app.get('/guild/:guildId/:userId/roles', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            var user = guild.members.get(req.params.userId); // Get the member.
            var roles = []; // The user's roles.

            user.roles.sort((b, a) => { if (b.position < a.position) return 1; if (b.position > a.position) return -1; if (b.position == a.position) return 0; }).forEach((role) => {
                roles.push({name: role.name, editable: role.editable, position: role.position, color: role.hexColor, id: role.id});
            });

            res.send(roles); // Send the roles in an array.
        });

        app.get('/guild/:guildId/:userId/kick', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            var user = guild.members.get(req.params.userId); // Get the member.

            user.kick().then((role) => {
                res.send({"statusCode": 0, "content": "User successfully removed."}); // Say that the role was added.
            }).catch((e) => {
                res.send({"statusCode": 500, "content": e}); // Say that the role wasn't added.
            }); // Add the role to the user.
        });

        app.get('/guild/:guildId/:userId/ban', (req, res) => {
            var guild = client.guilds.get(req.params.guildId); // Get the guild.
            var user = guild.members.get(req.params.userId); // Get the member.

            user.ban().then((role) => {
                res.send({"statusCode": 0, "content": "User successfully banned."}); // Say that the role was added.
            }).catch((e) => {
                res.send({"statusCode": 500, "content": e}); // Say that the role wasn't added.
            }); // Add the role to the user.
        });

        app.get('/guild/:guildId/role_census', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.
            
            var role_census = {}; // Role census.
            
            // Loop through the guild's roles.
            client.guilds.get(req.params.guildId).roles.forEach((role) => {
                role_census[role.name] = {}; // Get a role instance.
                role_census[role.name]["size"] = role.members.size; // Set the size.
                role_census[role.name]["isAdministrator"] = role.hasPermission("ADMINISTRATOR"); // See if it's an ADMIN role.
                role_census[role.name]["isStaff"] = role.hasPermission("ADMINISTRATOR") || role.hasPermission("MANAGE_MESSAGES") || role.hasPermission("KICK_MEMBERS") || role.hasPermission("BAN_MEMBERS") || role.hasPermission("MANAGE_CHANNELS"); // See if it's a Staff role.
                role_census[role.name]["isHoisted"] = role.hoist == true; // See if it's hoisted.
            });

            res.send(role_census); // Send the final JSON.
        });
    }
}

module.exports = WebPanelPlugin;