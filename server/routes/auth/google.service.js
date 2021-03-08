const config = require('config.json');
const crypto = require("crypto");
const db = require('helpers/db');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const role = require('../../helpers/role');

const { ErrorHandler } = require('../../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../../helpers/error-type');
const { report } = require('process');

module.exports = {
    auth,
    link,
    unlink,
    refreshTokenGoogle
}

async function getGoogleProfile(access_token)
{
    var data = new URLSearchParams();

    data.append('access_token', access_token)
    var response;
    try {
        response = await axios.post('https://www.googleapis.com/oauth2/v3/userinfo', data)
    } catch {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    if (!response || !response.data)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    return response.data;
}

async function getGoogleAccessToken(code, redirect_uri, origin)
{
    var data = new URLSearchParams();

    if (!code)
        return null;
    data.append('code', code)
    data.append('client_id', (origin === "web") ? process.env.REACT_APP_GOOGLE_CLIENT_ID : process.env.APP_GOOGLE_CLIENT_ID)
    if (origin === "web")
        data.append('client_secret', process.env.REACT_APP_GOOGLE_SECRET)
    data.append('redirect_uri', redirect_uri)
    data.append('grant_type', 'authorization_code')
    var token;
    var response;
    try {
        response = await axios.post('https://oauth2.googleapis.com/token', data)
    } catch {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    if (!response.data)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    if (!response.data.refresh_token)
        throw new ErrorHandler(...MISSING_REFRESH_TOKEN);
    token = {access_token: response.data.access_token, refresh_token: response.data.refresh_token};
    return token;
}

async function refreshTokenGoogle(refresh_token, origin)
{
    var data = new URLSearchParams();

    data.append('client_id', (origin === "web") ? process.env.REACT_APP_GOOGLE_CLIENT_ID : process.env.APP_GOOGLE_CLIENT_ID)
    if (origin === "web")
        data.append('client_secret', process.env.REACT_APP_GOOGLE_SECRET)
    data.append('refresh_token', refresh_token)
    data.append('grant_type', 'refresh_token')
    var response = await axios.post('https://oauth2.googleapis.com/token', data)

    return response.data.access_token;
}

async function auth(code, redirect_uri, origin, ipAdress) {
    const token = await getGoogleAccessToken(code, redirect_uri, origin);
    var user = null;
    const profile = await getGoogleProfile(token.access_token);
    if (!profile && !profile.sub)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findOne({ 'google.id' : profile.sub, 'local.provider': "google" });
    if (user) {
        user.google.token = token;
        await user.save();
    } else {
        user = new db.User();
        user.local.email = profile.email;
        user.local.username = profile.name;
        user.local.provider = 'google';
        user.google.id = profile.sub;
        user.google.username = profile.name;
        user.google.access_token = token.access_token;
        user.google.refresh_token = token.refresh_token;
        user.google.origin = origin
        user.google.email = profile.email;
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
    const token = await getGoogleAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token.access_token || !token.refresh_token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    const profile = await getGoogleProfile(token.access_token);
    if (!profile || !profile.sub)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    if (user.local.provider == "google")
        throw new ErrorHandler(...LINK_ACCOUNT);
    user.google.id = profile.sub;
    user.google.username = profile.name;
    user.google.access_token = token.access_token;
    user.google.refresh_token = token.refresh_token;
    user.google.origin = origin
    user.google.email = profile.email;
    await user.save();
    return;
}

async function unlink(user_id) {
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    if (user.local.provider == "google")
        throw new ErrorHandler(...UNLINK_ACCOUNT);
    user.google = undefined;
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
