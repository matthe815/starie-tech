const Plugin = require("../../plugin-manager/plugin");
const request = require('request');
const jszip = require('jszip');
const fs = require('fs');

class SPM extends Plugin {
    constructor(manager)
    {
        super(manager, {
            id: "SPM",
            name: "Starie Plugin Manager",
            description: "Automatically manages & installs plugins from the SPM database",
            author: ["Matthe815"],
            version: "1.0.0"
        });

        this.MyInterface = null;
    }

    load() {
        console.log("Starie Plugin Manager initalized.");

        this.MyInterface = this.manager.plugins.get("my-interface"); // Get the My Interface plugin.
        this.MyInterface.register(new InstallCommand(this.manager, this.MyInterface)); // Register a new command.
    }
}

class InstallCommand {
    constructor(manager, ie) {
        this.manager = manager;
        this.name = "install";
        this.ie = ie;
        this.uploadURL = "https://framework.starie.rocks/plugin/upload";
    }
    
    response(args) {
        this.uploadPlugin(args[0], args[1]);
    }

    uploadPlugin(plugin, version) {
        const zip = new jszip();
        zip.file("index.js", "test");
        console.log(`/${plugin}-${version}.zip`);
        
        zip.generateAsync({type: "nodebuffer"}).then((content) => {
            fs.writeFileSync(__dirname + `/${plugin}-${version}.zip`, content); // Write to the file.

            var req = request.post(`${this.uploadURL}/${plugin}/${version}`, (err, resp, body) => {});
    
            var form = req.form();
            form.append('file', fs.createReadStream(`${plugin}-${version}.zip`));
        });
    }
}

module.exports = SPM;