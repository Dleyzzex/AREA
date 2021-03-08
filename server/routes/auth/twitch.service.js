const db = require('helpers/db');
const axios = require('axios');

const { ErrorHandler } = require('../../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../../helpers/error-type');
const { report } = require('process');

module.exports = {
    link,
    unlink,
    refreshTokenTwitch
}

async function getTwitchProfile(access_token, origin)
{
    if (!access_token)
        return null;
    var header = "Bearer " + access_token;
    var cliendId = (origin === "web") ? process.env.REACT_APP_TWITCH_CLIENT_ID : process.env.APP_TWITCH_CLIENT_ID;
    var config = {

        headers: {
            'Authorization': header,
            'Client-Id': cliendId
        },
    }
    var response;
    try {
        response = await axios.get('https://api.twitch.tv/helix/users', config)
    } catch(e) {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    return response.data.data
}

async function getTwitchAccessToken(code, redirect_uri, origin)
{
    var data = new URLSearchParams();

    if (!code)
        return null;
    data.append('client_id', (origin === "web") ? process.env.REACT_APP_TWITCH_CLIENT_ID : process.env.APP_TWITCH_CLIENT_ID)
    data.append('client_secret', (origin === "web") ? process.env.REACT_APP_TWITCH_SECRET : process.env.APP_TWITCH_SECRET)
    data.append('code', code)
    data.append('redirect_uri', redirect_uri)
    data.append('grant_type', 'authorization_code')
    var response;
    var token;
    try {
        response = await axios.post('https://id.twitch.tv/oauth2/token', data)
    } catch(e) {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    token = {access_token: response.data.access_token, refresh_token: response.data.refresh_token}
    return token;
}

async function refreshTokenTwitch(refresh_token, origin)
{
    var data = new URLSearchParams();

    data.append('client_id', (origin === "web") ? process.env.REACT_APP_TWITCH_CLIENT_ID : process.env.APP_TWITCH_CLIENT_ID)
    data.append('client_secret', (origin === "web") ? process.env.REACT_APP_TWITCH_SECRET : process.env.APP_TWITCH_SECRET)
    data.append('refresh_token', refresh_token)
    data.append('grant_type', 'refresh_token')
    var response;
    try {
        response = await axios.post('https://id.twitch.tv/oauth2/token', data)
    } catch (e){
        //TODO: throw
    }
    //if (!response.data)
        //TODO: throw
    return response.data.access_token;
}

async function link(user_id, redirect_uri, code, origin) {
    const token = await getTwitchAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    const res = await getTwitchProfile(token.access_token, origin);
    if (!res || !res[0].id || !res[0].display_name)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    user.twitch.id = res[0].id;
    user.twitch.username = res[0].display_name;
    user.twitch.access_token = token.access_token;
    user.twitch.refresh_token = token.refresh_token;
    user.twitch.origin = origin;
    await user.save();
    return;
}

async function unlink(user_id) {
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    user.twitch = undefined;
    await user.save();
    return;
}