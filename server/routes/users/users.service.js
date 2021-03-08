const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('helpers/db');
const role = require('../../helpers/role');

module.exports = {
    register,
    authenticate,
    refreshToken,
    revokeToken,
    getAll,
    getById,
    getRefreshTokens,
    updatePassword,
    updateEmail,
    _delete
};

async function register(username, email, password, ipAddress) {
    const user = await db.User.findOne({email: email});
    if (user) {
        throw 'User already exist';
    }
    const new_user = new db.User({
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 10),
        role: role.User,
        provider: 'local'
    });
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

    const user = await db.User.findOne({ email: email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        throw 'email or password is incorrect';
    }
    

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
        //refreshToken: refreshToken.token
    };
}

async function refreshToken(token, ipAddress) {
    const refreshToken = await getRefreshToken(token);
    const { user } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(user);

    // return basic details and tokens
    return { 
        ...basicDetails(user),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken(token, ipAddress) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getAll() {
    const users = await db.User.find();
    return users.map(x => basicDetails(x));
}

async function getById(id) {
    const user = await getUser(id);
    return basicDetails(user);
}

async function getRefreshTokens(userId) {
    // check that user exists
    await getUser(userId);

    // return refresh tokens for user
    const refreshTokens = await db.RefreshToken.find({ user: userId });
    return refreshTokens;
}

async function updatePassword(id, password) {
    const user = await getUser(id);
    if (!user)
        throw 'User not found';
    if (bcrypt.compareSync(password, user.password))
        throw 'password cannot be updated by itself';
    user.password = bcrypt.hashSync(password, 10);
    await user.save();
    return;
}

async function updateEmail(id, email) {
    const user = await getUser(id);
    if (!user)
        throw 'User not found';
    if (user.email == email)
        throw 'email cannot be updated by itself';
    user.email = email;
    await user.save();
    return;
}

async function _delete(id) {
    if (!db.isValidId(id))
        throw 'User not found';
    await db.User.findByIdAndRemove({ _id: id});

    return;
}

// helper functions

async function getUser(id) {
    if (!db.isValidId(id)) throw 'User not found';
    const user = await db.User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
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
    const { id, email, username, role} = user;
    return { id, email, username , role};
}
