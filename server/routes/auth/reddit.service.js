const db = require('helpers/db');
const qs = require('qs');
const axios = require('axios');

const { ErrorHandler } = require('../../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../../helpers/error-type');
const { report } = require('process');

module.exports = {
    link,
    unlink,
    refreshTokenReddit
}

async function getRedditProfile(access_token)
{
    var header = "Bearer " + access_token;
    var config = {

        headers: {
            'Authorization': header,
        },
    }
    var response;
    try {
        response = await axios.get('https://oauth.reddit.com/api/v1/me', config)
    } catch(e) {
        console.log(response);
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    return response.data;
}

async function getRedditAccessToken(code, redirect_uri, origin)
{
    var data = new URLSearchParams();
    var auth;
    
    if (origin == "web")
        auth = "Basic " + new Buffer.from(process.env.REACT_APP_REDDIT_CLIENT_ID + ":" + process.env.REACT_APP_REDDIT_CLIENT_SECRET).toString('base64');
    else
        auth = "Basic " + new Buffer.from(process.env.APP_REDDIT_CLIENT_ID + ":" + process.env.APP_REDDIT_CLIENT_SECRET).toString('base64');
    data.append('code', code)
    data.append('redirect_uri', redirect_uri)
    data.append('grant_type', 'authorization_code')
    var response;
    var token;
    try {
        response = await axios.post('https://www.reddit.com/api/v1/access_token', data, {headers: {'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded'}});
    } catch(e) {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    token = {access_token: response.data.access_token, refresh_token: response.data.refresh_token};
    return token;
}

async function refreshTokenReddit(refresh_token, origin)
{
    var data = new URLSearchParams();
    var auth;

    if (origin == "web")
        auth = "Basic " + new Buffer.from(process.env.REACT_APP_REDDIT_CLIENT_ID + ":" + process.env.REACT_APP_REDDIT_CLIENT_SECRET).toString('base64');
    else
        auth = "Basic " + new Buffer.from(process.env.APP_REDDIT_CLIENT_ID + ":" + process.env.APP_REDDIT_CLIENT_SECRET).toString('base64');
    data.append('refresh_token', refresh_token)
    data.append('grant_type', 'refresh_token')
    var response;
    try {
        response = await axios.post('https://www.reddit.com/api/v1/access_token', data, {headers: {'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded'}})
    } catch (e){
        //TODO: throw
    }
    //if (!response.data)
        //TODO: throw
    return response.data.access_token;
}

async function link(user_id, redirect_uri, code, origin) {
    const token = await getRedditAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    console.log(token);
    const res = await getRedditProfile(token.access_token);
    if (!res || !res.id || !res.name)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    user.reddit.id = res.id;
    user.reddit.username = res.name;
    user.reddit.access_token = token.access_token;
    user.reddit.refresh_token = token.refresh_token;
    user.reddit.origin = origin
    await user.save();
    return;
}

async function unlink(user_id) {
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    user.reddit = undefined;
    await user.save();
    return;
}