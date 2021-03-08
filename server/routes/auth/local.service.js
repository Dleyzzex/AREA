const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('helpers/db');
const role = require('../../helpers/role');

const { ErrorHandler } = require('../../helpers/error');
const { USER_NOT_FOUND, INVALID_CREDENTIALS, USER_ALREADY_EXIST, UNAUTHORIZED } = require('../../helpers/error-type');

module.exports = {
    register,
    authenticate,
    refreshToken,
    revokeToken,
    getRefreshTokens
};

async function register(username, email, password, ipAddress) {
    const user = await db.User.findOne({'local.email': email});
    if (user)
        throw new ErrorHandler(...USER_ALREADY_EXIST);
    const new_user = new db.User;
    new_user.local.email = email;
    new_user.local.password = bcrypt.hashSync(password, 10);
    new_user.local.username = username;
    new_user.role = role.User;
    new_user.local.provider = "local";
    await new_user.save();
    const access_token = generateJwtToken(new_user);
    const refresh_token = generateRefreshToken(new_user, ipAddress);
    await refresh_token.save();
    return {
        ...basicDetails(new_user),
        access_token,
        refresh_token
    }
}

async function authenticate(email, password, ipAddress) {

    const user = await db.User.findOne({'local.email': email });

    if (!user || !bcrypt.compareSync(password, user.local.password))
        throw new ErrorHandler(...INVALID_CREDENTIALS);
    
    // authentication successful so generate jwt and refresh tokens
    const access_token = generateJwtToken(user);
    const refresh_token = generateRefreshToken(user, ipAddress);

    // save refresh token
    await refresh_token.save();

    // return basic details and tokens
    return { 
        ...basicDetails(user),
        access_token,
        refresh_token
        //refreshToken: refreshToken.token    await refresh_token.save();

    };
}

async function refreshToken(token, ipAddress) {

    if (!token)
        throw new ErrorHandler(...UNAUTHORIZED)
    const refreshToken = await getRefreshToken(token);
    if (!refreshToken)
        throw new ErrorHandler(...UNAUTHORIZED)
    const { user } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();
    // generate new jwt
    const access_token = generateJwtToken(user);
    // return basic details and tokens
    return { 
        access_token,
        refresh_token: newRefreshToken
    };
}

async function revokeToken(token, ipAddress) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getRefreshTokens(userId) {    
    try {
        await getUser(userId);
    } catch {
        throw new ErrorHandler(...UNAUTHORIZED);
    }
    // return refresh tokens for user
    const refresh_tokens = await db.RefreshToken.find({ user: userId });
    return refresh_tokens;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne( {'token': token.token }).populate('user');

    if (!refreshToken || !refreshToken.isActive) {
        throw new ErrorHandler(...UNAUTHORIZED);
    }
    return refreshToken;
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
