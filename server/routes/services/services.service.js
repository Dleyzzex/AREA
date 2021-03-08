const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('helpers/db');
const role = require('../../helpers/role');

module.exports = {
    status,
    getAll,
    getAction,
    getReaction
};

async function status(user_id) {
    
    const user = await db.User.findById(user_id);

    if (!user) {
        throw 'email or password is incorrect';
    }

    return {
        google: user.google ? user.google.access_token ? true : false : false,
        github: user.github ? user.github.token ? true : false : false,
        microsoft: user.microsoft ? user.microsoft.access_token ? true : false : false,
        reddit: user.reddit ? user.reddit.access_token ? true : false : false,
        twitch: user.twitch ? user.twitch.access_token ? true : false : false,
    }
}

async function getAll() {
    const services = await db.Service.find();
    return services.map(x => serviceBasicDetails(x))
}

async function getAction(id) {
    const service = await db.Service.findById(id)
    return service.actions.map(x => actionBasicDetails(x))
}

async function getReaction(id) {
    const service = await db.Service.findById(id)
    return service.reactions.map(x => reactionBasicDetails(x))
}

function serviceBasicDetails(service) {
    const { id, name, description } = service;
    return { id, name, description };
}

function actionBasicDetails(service) {
    const { id, name, description, } = service;
    const parameters = service.parameters.map(x => parameterBasicDetials(x));
    const results = service.results.map(x => resultBasicDetials(x));
    return { id, name, description, parameters, results };
}

function reactionBasicDetails(service) {
    const { id, name, description, } = service;
    const parameters = service.parameters.map(x => parameterBasicDetials(x));
    return { id, name, description, parameters };
}

function parameterBasicDetials(parameter) {
    const {id, name, description, type, required} = parameter;
    return { id, name, description, type, required}
}

function resultBasicDetials(parameter) {
    const {id, name, description, type} = parameter;
    return { id, name, description, type}
}

