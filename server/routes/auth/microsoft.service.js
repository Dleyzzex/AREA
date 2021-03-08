const config = require('config.json');
const crypto = require("crypto");
const db = require('helpers/db');
const role = require('../../helpers/role');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const { ErrorHandler } = require('../../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN, INVALID_CREDENTIALS } = require('../../helpers/error-type');


module.exports = {
    auth,
    link,
    unlink,
    refreshTokenMicrosoft
}

async function getMicrosoftAccessToken(code, redirect_uri, origin)
{
    var data = new URLSearchParams();
    data.append('code', code)
    data.append('client_id', (origin === "web") ? process.env.REACT_APP_MICROSOFT_CLIENT_ID : process.env.APP_MICROSOFT_CLIENT_ID)
    if (origin === "web")
        data.append('client_secret', process.env.REACT_APP_MICROSOFT_SECRET)
    data.append('redirect_uri', redirect_uri)
    data.append('grant_type', 'authorization_code')
    data.append('scope', 'user.read offline_access Mail.ReadBasic Mail.Read Mail.ReadWrite Mail.Send Calendars.Read Calendars.ReadWrite Tasks.ReadWrite')
    var response;
    var token;
    try {
        response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', data)
    } catch (e){
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    if (!response.data)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    if (!response.data.refresh_token)
        throw new ErrorHandler(...MISSING_REFRESH_TOKEN);
    token = {access_token: response.data.access_token, refresh_token: response.data.refresh_token};
    return token;
}

async function refreshTokenMicrosoft(refresh_token, origin)
{
    var data = new URLSearchParams();

    data.append('client_id', (origin === "web") ? process.env.REACT_APP_MICROSOFT_CLIENT_ID : process.env.APP_MICROSOFT_CLIENT_ID)
    if (origin === "web")
        data.append('client_secret', process.env.REACT_APP_MICROSOFT_SECRET)
    data.append('refresh_token', refresh_token)
    data.append('grant_type', 'refresh_token')
    var response;
    try {
        response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', data)
    } catch (e){
        //TODO: throw
    }
    //if (!response.data)
        //TODO: throw
    return response.data.access_token;
}

async function getMicrosoftProfile(access_token)
{
    var data = new URLSearchParams();
    data.append('access_token', access_token)
    var config = {
        headers: {'Authorization': access_token, 'Accept': 'application/json'}}
    var response;
    try {
        response = await axios.get('https://graph.microsoft.com/v1.0/me', config)
    } catch (e) {
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    }
    return response.data;
}

async function auth(code, redirect_uri, origin, ipAdress) {
    const token = await getMicrosoftAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token.access_token || !token.refresh_token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    const profile = await getMicrosoftProfile(token.access_token);
    if (!profile || !profile.id)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findOne({ 'microsoft.id' : profile.id, 'local.provider': 'microsoft' });
    if (user) {
        user.microsoft.token = token;
        await user.save();
    } else {
        user = new db.User();
        user.local.email = profile.mail;
        user.local.username = profile.displayName;
        user.local.provider = 'microsoft';
        user.microsoft.id = profile.id;
        user.microsoft.username = profile.givenName;
        user.microsoft.access_token = token.access_token;
        user.microsoft.refresh_token = token.refresh_token;
        user.microsoft.origin = origin;
        user.microsoft.email = profile.email;
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
    const token = await getMicrosoftAccessToken(code, redirect_uri, origin);
    var user = null;
    if (!token)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    const profile = await getMicrosoftProfile(token.access_token);
    if (!profile || !profile.id)
        throw new ErrorHandler(...INVALID_AUTH_CODE);
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    if (user.local.provider == "microsoft")
        throw new ErrorHandler(...LINK_ACCOUNT);
    user.microsoft.id = profile.id;
    user.microsoft.username = profile.displayName;
    user.microsoft.access_token = token.access_token;
    user.microsoft.refresh_token = token.refresh_token;
    user.microsoft.origin = origin;
    user.microsoft.email = profile.email;
    await user.save();
    return;
}

async function unlink(user_id) {
    user = await db.User.findById(user_id);
    if (!user)
        throw new ErrorHandler(...USER_NOT_FOUND);
    if (user.local.provider == "microsoft")
        throw new ErrorHandler(...UNLINK_ACCOUNT);
    user.microsoft = undefined;
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
