const config = require('config.json');
const crypto = require("crypto");
const db = require('helpers/db');
const role = require('../../helpers/role');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { ErrorHandler } = require('../../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../../helpers/error-type');

module.exports = {
    auth,
    link,
    unlink
}

async function getGithubProfile(access_token)
{
    var data = new URLSearchParams();

    data.append('access_token', access_token)
    var config = {
        headers: {'Authorization': 'token ' + access_token}
    }
    var profile;
    var email;
    try {
        var user_response = await axios.get('https://api.github.com/user', config)
        profile = user_response.data;
        var email_response = await axios.get('https://api.github.com/user/emails', config)
        email = email_response.data;
    } catch {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    var res = { profile: profile, emails: email};
    return res;
}

async function getGithubAccessToken(code, redirect_uri, origin)
{
    var data = new URLSearchParams();
    data.append('code', code)
    data.append('client_id', (origin === "web") ? process.env.REACT_APP_GITHUB_CLIENT_ID : process.env.APP_GITHUB_CLIENT_ID)
    data.append('client_secret', (origin === "web") ? process.env.REACT_APP_GITHUB_SECRET : process.env.APP_GITHUB_SECRET)
    data.append('redirect_uri', redirect_uri)
    data.append('scope', 'user:read user:email')
    var response
    try {
        response = await axios.post('https://github.com/login/oauth/access_token', data, {headers: {'Accept': 'application/json'}})
        console.log(response)
    } catch(e) {

        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    if (!response || !response.data)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    if (!response.data.access_token)
        throw new ErrorHandler(...MISSING_REFRESH_TOKEN);
    return response.data.access_token;
}

async function refreshTokenGithub(refresh_token)
{
    //TODO: changé les parametre API pour avoir refresh token

    /*var data = new URLSearchParams();

    //TODO: add origin for mobile
    data.append('client_id', process.env.REACT_APP_GITHUB_CLIENT_ID)
    data.append('client_secret', process.env.REACT_APP_GITHUB_SECRET)
    data.append('refresh_token', refresh_token)
    data.append('grant_type', 'refresh_token')
    var response;
    try {
        response = await axios.post('https://github.com/login/oauth/access_token', data, {headers: {'Accept': 'application/json'}})
    } catch (e){
        //TODO: throw
    }
    //if (!response.data)
        //TODO: throw
    return response.data.access_token;*/
}

async function auth(code, redirect_uri, origin, ipAdress) {
    const token = await getGithubAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    const res = await getGithubProfile(token);
    if (!res || !res.profile || !res.profile.id || !res.emails)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findOne({ 'github.id' : res.profile.id, 'local.provider': "github" });
    if (user) {
        user.github.token = token;
        await user.save();
    } else {
        user = new db.User();
        user.local.email = res.emails[0].email;
        user.local.username = res.profile.login;
        user.local.provider = 'github';
        user.github.id = res.profile.id;
        user.github.token = token;
        user.github.username = res.profile.login;
        user.role = role.User;
        await user.save();
    }
    const access_token = generateJwtToken(user);
    const refresh_token = generateRefreshToken(user, ipAdress);
    await refresh_token.save();

    return {
        ...basicDetails(user),
        access_token,
        refresh_token
    };
}

async function link(user_id, redirect_uri, code, origin) {
    const token = await getGithubAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    const res = await getGithubProfile(token);
    if (!res || !res.profile || !res.profile.id)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    if (user.local.provider == "github")
        throw new ErrorHandler(...LINK_ACCOUNT);
    user.github.id = res.profile.id;
    user.github.token = token;
    user.github.username = res.profile.login;
    await user.save();
    return;
}

async function unlink(user_id) {
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    if (user.local.provider == "github")
        throw new ErrorHandler(...UNLINK_ACCOUNT);
    user.github = undefined;
    await user.save();
    return;
}

function generateJwtToken(user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '50m' });
}

function generateRefreshToken(user, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(user) {
    const { id, local, role} = user;
    const { email, username, provider } = local;
    return { id, email, username , role, provider};
}