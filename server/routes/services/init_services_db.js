const db = require("../../helpers/db");
const fs = require('fs');

module.exports = init_services_db;

async function init_services_db()
{
    var raw = fs.readFileSync('config/services.json');
    var services = JSON.parse(raw);

    for (i = 0; i < services.length; i++) {
        var tmp = new db.Service;
        if (services[i].actions)
            tmp.actions = services[i].actions;
        if (services[i].reactions)
            tmp.reactions = services[i].reactions;
        tmp.name = services[i].name;
        tmp.description = services[i].description;
        try { 
            await tmp.save();
        } catch {
    
        }
    }
    return
}