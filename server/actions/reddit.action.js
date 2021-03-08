const axios = require('axios');

const { ErrorHandler } = require('../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    getNewPost,
    getNews
}

// ACTIONS
async function getNewPost(user, username)
{
    var header = "bearer " + user.reddit.access_token;
    var config = {
        headers: {
            'Authorization': header
        }
    }
    var request = 'https://oauth.reddit.com/user/'+ username + '/submitted?sort=new';
    var response = await axios.get(request, config);

    var res;
    if (response.data.data.children != undefined) {
        res = {
            id: response.data.data.children[0].data.id,
            title: response.data.data.children[0].data.title,
            message: response.data.data.children[0].data.selftext
        }
        return (res);
    }
    return (undefined);
}

async function getNews(user, sub)
{
    var header = "bearer " + user.reddit.access_token;
    var config = {
        headers: {
            'Authorization': header
        }
    }
    var request = 'https://oauth.reddit.com/r/'+ sub + '/new';
    var response;
    
    response = await axios.get(request, config);
    var res;
    if (response.data.data.children != undefined) {
        res = {
            id: response.data.data.children[0].data.id,
            title: response.data.data.children[0].data.title,
            message: response.data.data.children[0].data.selftext
        }
        return (res);
    }
    return (undefined);
}