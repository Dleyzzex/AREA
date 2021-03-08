const axios = require('axios');

const { ErrorHandler } = require('../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    getOnLive
}

// ACTIONS

async function getOnLive(user, who)
{
    var auth = 'Bearer ' + user.twitch.access_token;
    var request = 'https://api.twitch.tv/helix/streams?user_login=' + who;
    var config = {
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Authorization': auth,
          'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID
        }
    };
    var response = await axios.get(request, config);

    if (response.data.data[0] == null)
        return (undefined);
    var res = {
        name: response.data.data[0].user_name,
        game: response.data.data[0].game_name,
        status: response.data.data[0].type
    }
    return (res);
}