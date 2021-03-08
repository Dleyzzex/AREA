const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const validateRequest = require('middleware/validate-request');
const authorize = require('middleware/authorize');

const localService = require('./local.service');
const googleService = require('./google.service');
const githubService = require('./github.service');
const microsoftService = require('./microsoft.service');
const redditService = require('./reddit.service');
const twitchService = require('./twitch.service');

router.post("/auth/google", authProviderSchema, signWithGoogle);
router.post("/auth/google/link", authorize(), authProviderSchema, linkGoogle);
router.post("/auth/google/unlink", authorize(), unlinkGoogle);

router.post("/auth/github", authProviderSchema, signWithGithub);
router.post("/auth/github/link", authorize(), authProviderSchema, linkGithub);
router.post("/auth/github/unlink", authorize(), unlinkGithub);

router.post("/auth/microsoft", authProviderSchema, signWithMicrosoft);
router.post("/auth/microsoft/link", authorize(), authProviderSchema, linkMicrosoft);
router.post("/auth/microsoft/unlink", authorize(), unlinkMicrosoft);

router.post("/auth/reddit/link", authorize(), authProviderSchema, linkReddit);
router.post("/auth/reddit/unlink", authorize(), unlinkReddit);

router.post("/auth/twitch/link", authorize(), authProviderSchema, linkTwitch);
router.post("/auth/twitch/unlink", authorize(), unlinkTwitch);

router.post("/auth/signin", signinSchema, signin);
router.post("/auth/signup", signupSchema, signup);
router.post("/auth/refresh-token", refreshToken);

module.exports = router;

function signupSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function signinSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authProviderSchema(req, res, next) {
    const schema = Joi.object({
        authorization_code: Joi.string().required(),
        redirect_uri: Joi.string().required(),
        origin: Joi.any().valid("web", "mobile").required()
    });
    validateRequest(req, next, schema);
}

function signin(req, res, next) {
    const {email, password} = req.body;
    const ipAddress = req.ip;
    localService.authenticate(email, password, ipAddress)
    .then(({ refresh_token, access_token, ...user}) => {
        setTokenCookie(res, refresh_token);
        res.json({ user, access_token: access_token });
    })
    .catch(next);
}

function signup(req, res, next) {
    const {username, email, password} = req.body;
    const ipAddress = req.ip;
    localService.register(username, email, password, ipAddress)
        .then(({ refresh_token, access_token, ...user}) => {
            setTokenCookie(res, refresh_token);
            res.json({user, access_token: access_token});
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refresh_token;
    const ipAddress = req.ip;
    localService.refreshToken(token, ipAddress)
    .then(({ refresh_token, access_token}) => {
        setTokenCookie(res, refresh_token);
        res.json({access_token: access_token});
    })
    .catch(next);
}

function signWithGoogle(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;
    const ipAddress = req.ip;

    googleService.auth(authorization_code, redirect_uri, origin, ipAddress)
    .then(({ refresh_token, access_token, ...user}) => {
        setTokenCookie(res, refresh_token);
        res.json({user, access_token: access_token});
    })
    .catch(next);
}

function linkGoogle(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;

    googleService.link(req.user.id, redirect_uri, authorization_code, origin)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function unlinkGoogle(req, res, next) {
    googleService.unlink(req.user.id)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function signWithGithub(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;
    const ipAddress = req.ip;
    githubService.auth(authorization_code, redirect_uri, origin, ipAddress)
    .then(({ refresh_token, access_token, ...user}) => {
        setTokenCookie(res, refresh_token);
        res.json({user, access_token: access_token});
    })
    .catch(next);
}

function linkGithub(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;

    githubService.link(req.user.id, redirect_uri, authorization_code, origin)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function unlinkGithub(req, res, next) {
    githubService.unlink(req.user.id)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function signWithMicrosoft(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;
    const ipAddress = req.ip;
    microsoftService.auth(authorization_code, redirect_uri, origin, ipAddress)
    .then(({ refresh_token, access_token, ...user}) => {
        setTokenCookie(res, refresh_token);
        res.json({user, access_token: access_token});
    })
    .catch(next);
}

function linkMicrosoft(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;

    microsoftService.link(req.user.id, redirect_uri, authorization_code, origin)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function unlinkMicrosoft(req, res, next) {
    microsoftService.unlink(req.user.id)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function linkReddit(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;

    redditService.link(req.user.id, redirect_uri, authorization_code, origin)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function unlinkReddit(req, res, next) {
    redditService.unlink(req.user.id)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function linkTwitch(req, res, next) {
    const { authorization_code, redirect_uri, origin } = req.body;

    twitchService.link(req.user.id, redirect_uri, authorization_code, origin)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function unlinkTwitch(req, res, next) {
    twitchService.unlink(req.user.id)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function setTokenCookie(res, token)
{
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refresh_token', token, cookieOptions);
}