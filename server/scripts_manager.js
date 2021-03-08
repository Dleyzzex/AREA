const cron = require('node-cron');
const db = require('./helpers/db');

global.running_scripts = [];
var { dictionnary } = require('./actions/actions')

async function init_scripts()
{
    var scripts = await db.Script.find();
    for (s of scripts) {
        var script = {
            id: s._id,
            user_id: s.user,
            last_update: s.last_update,
            trigger: s.trigger,
            action: s.action,
            reaction: s.reaction,
            action_parameters: s.action_parameters,
            reaction_parameters: s.reaction_parameters,
            status: s.status,
            storage: undefined
        }
        running_scripts.push(script);
    }
}

function scripts_manager()
{
    init_scripts();

    cron.schedule('*/10 * * * * *', async function() {
        var updated = 0;
        var triggered = 0;

        var running = 0;
        var stopped = 0;
        var errors = 0;

        for (s of running_scripts) {
            var last = Date.parse(s.last_update) / 1000;
            var now = Math.round(new Date().getTime() / 1000);
            var diff = now - last;
            if (s.status != "running") {
                if (s.status == "stopped")
                    stopped++;
                else
                    errors++
                continue;
            }
            running++;
            if (diff / 60 >= s.trigger  ) {
                updated++;
                s.last_update = new Date()
                var return_value = await dictionnary[s.action.handler](s.user_id, s.storage, ...s.action_parameters)
                if (return_value && return_value.results != undefined) {
                    const { storage, results } = return_value;
                    s.storage = storage;
                    var buffer = new Array(s.reaction_parameters.length);

                    var i = 0;
                    for (const r of s.reaction_parameters) {
                        var res = r.match(/^{+[0-9]+}$/g)
                        if (res && res[0])
                            buffer[i] = results[res[0].slice(1, -1)];
                        else
                            buffer[i] = s.reaction_parameters[i];
                        i++;
                    }
                    dictionnary[s.reaction.handler](s.user_id, ...buffer)
                    triggered++;
                }
                else if (return_value && return_value.storage) {
                    const { storage } = return_value;
                    s.storage = storage;
                }
            }
    
        }
        console.log('\x1b[33m%s\x1b[0m', '[SCRIPTS MANAGER] ' + running + ' running  ' + stopped + ' stopped  ' + errors + ' errors  '+ updated + ' updated  ' + triggered + ' triggered');
    });
}

module.exports = {
    scripts_manager
}