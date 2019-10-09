/// *************************
/// Script Start スクリプト・スターター
/// *************************
const Discord = require("discord.js"), 
    client = new Discord.Client(), 
    Loader = require("CI-Intrepreter").Loader, 
    PM = require("./plugin-manager/autoloader.js"), 
    chalk = require("chalk"), 
    fs = require('fs'), 
    clear = require('clear');

Loader.load("config/config.json");

/// *************************
/// Configuration loader コンフィグ・ローダ
/// *************************
if (!fs.existsSync("config"))
    fs.mkdirSync("config");

if (!fs.existsSync("config/config.json"))
    fs.writeFileSync("config/config.json", JSON.stringify({"bot": { "token": ""}}));

const config = JSON.parse(fs.readFileSync('./config/config.json'));

client.on("ready", () => {
    const PluginManager = new PM(this, client);

    /// *************************
    /// Event Handlers イベント
    /// Handles events fired from the plugin manager. プラグインマネージャはイベントを送るへ手がけります
    /// *************************
    PluginManager.on("plugin loaded", (plugin) => {
        console.log(chalk.keyword('yellow')(`[${plugin.name.toUpperCase()} v${plugin.version}]`) + `: ${plugin.name} has been loaded.`)
    });

    PluginManager.on("plugin pre loaded", (plugin) => {
        console.log(chalk.keyword('orange')(`${plugin.name} is running PreLoader code`))
    });

    PluginManager.on("all plugins loaded", () => {
        console.log("All plugins have finished loading.");
    });
    
    PluginManager
        .Initalize(`${__dirname}/plugins`);
});

clear();
client.login(config["bot"]["token"]);