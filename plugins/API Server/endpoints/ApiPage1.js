class ApiPage1 {

    constructor(api)
    {
        this.api = api;
    }

    register()
    {
        var app = this.api.manager.plugins.get("webserver").app, client = this.api.manager.client;
        console.log(`Registered ApiPoint1`);

        app.get('/api/guilds/:userId', (req, res) => {
            res.setHeader("Content-Type", "application/json"); // Set the content as a JSON.
            res.send(client.guilds.filter((guild) => guild.owner.id === req.params.userId).array()); // Send all of the guilds.
        });
    }
}

module.exports = ApiPage1;