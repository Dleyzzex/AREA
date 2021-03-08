const { func, array } = require('@hapi/joi');
const db = require('helpers/db');
const mongoose = require('mongoose');

module.exports = {
    getAll,
    create,
    update,
    _delete
};

async function getAll(user_id) {
    const scripts = await db.Script.find({user: user_id});
    return scripts.map(s => script_basicDetails(s));
}

async function create(user_id, action_id, reaction_id, action_parameters, reaction_parameters, trigger, name) {
    var new_script = new db.Script;

    const action_service = await db.Service.findOne({"actions._id": action_id});
    const reaction_service = await db.Service.findOne({"reactions._id": reaction_id});
    var action;
    var reaction;

    for (a of action_service.actions) {
        if (a._id == action_id)
            action = a;
    }
    for (r of reaction_service.reactions) {
        if (r._id == reaction_id)
            reaction = r;
    }
    new_script.name = name;
    new_script.action = action;
    new_script.reaction = reaction;
    new_script.action_parameters = action_parameters;
    new_script.reaction_parameters = reaction_parameters;
    new_script.user = user_id;
    new_script.trigger = trigger;
    new_script.status = "running";
    await new_script.save();
    var script = {
        id: new_script._id,
        name: new_script.name,
        user_id: user_id,
        last_update: new Date(),
        trigger: trigger,
        action: action,
        reaction: reaction,
        action_parameters: action_parameters,
        reaction_parameters: reaction_parameters,
        status: "running",
        storage: undefined
    }
    running_scripts.push(script);
    return;
}

async function update(script_id, status)
{
    if (!db.isValidId(script_id))
        return null
    var script = await db.Script.findById(script_id);
    if (!script)
        return null
    script.status = status;
    await script.save();
    for (var s of running_scripts) {
        if (s.id == script_id) {
            s.status = status;
        }
    }
    return script_basicDetails(script);
}

async function _delete(script_id) {
    if (!db.isValidId(script_id))
        return false;
    await db.Script.findByIdAndRemove(script_id);
    var i = 0;
    
    var idx = 0;
    for (var s of running_scripts) {
        if (s.id == script_id) {
            idx = i;
            break;
        }
        i++;
    }
    running_scripts.splice(idx, 1);
    return;
}

function action_basicDetails(a)
{
    const {id, name, description } = a;
    return {id, name, description };
}

function reaction_basicDetials(r)
{
    const {id, name, description} = r;
    return {id, name, description};
}

function script_basicDetails(script) {
    const { id, name, action, reaction, status, trigger} = script;
    return { id, name, action : action_basicDetails(action), reaction: reaction_basicDetials(reaction), status, trigger};
}
