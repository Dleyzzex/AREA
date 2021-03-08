const googleService = require("./google.action");
const microsoftService = require("./microsoft.action");
const githubService = require("./github.action");
const twitchService = require("./twitch.action");
const redditService = require("./reddit.action");
const weatherService = require("./weather.action");
const maybeService = require("./maybe.action");
const {refreshTokenGoogle} = require("../routes/auth/google.service");
const {refreshTokenMicrosoft} = require("../routes/auth/microsoft.service");
const {refreshTokenTwitch} = require("../routes/auth/twitch.service");
const {refreshTokenReddit} = require("../routes/auth/reddit.service");
const db = require('helpers/db');

var dictionnary = {};

// Google
dictionnary["action_google_mail_received"] = action_google_mail_received.bind();
dictionnary["action_google_new_video"] = action_google_new_video.bind();

dictionnary["reaction_google_mail_send"] = reaction_google_mail_send.bind();
dictionnary["reaction_google_like_video"] = reaction_google_like_video.bind();
dictionnary["reaction_google_dislike_video"] = reaction_google_dislike_video.bind();

// Microsoft
dictionnary["action_microsoft_mail_received"] = action_microsoft_new_mail_received.bind();

dictionnary["reaction_microsoft_create_todotask"] = reaction_microsoft_create_todotask.bind();
dictionnary["reaction_microsoft_send_mail"] = reaction_microsoft_send_mail.bind();
dictionnary["reaction_microsoft_create_event"] = reaction_microsoft_create_event.bind();

// Github
dictionnary["action_github_new_commit"] = action_github_new_commit.bind();

// Twitch
dictionnary["action_twitch_on_live"] = action_twitch_on_live.bind();

// Reddit
dictionnary["action_reddit_new_post"] = action_reddit_new_post.bind();
dictionnary["action_reddit_news"] = action_reddit_news.bind();

// Weather
dictionnary["action_weather_changed"] = action_weather_changed.bind();

// Maybe
dictionnary["action_yes_no"] = action_yes_no.bind();
dictionnary["action_yes_no_different"] = action_yes_no_different.bind();
dictionnary["action_yes_no_always"] = action_yes_no_always.bind();

// Test
dictionnary["test_reaction_handler_function"] = test_reaction_handler_function.bind();


// Google
async function action_google_mail_received(user_id, storage)
{
    console.log("mail google");
    var user = await db.User.findById(user_id);
    var mails;
    try {
        mails = await googleService.getMail(user);
    } catch {
        // invalid token
        var token = await refreshTokenGoogle(user.google.refresh_token, user.google.origin);/// = get access token
        //console.log(token);
        user.google.access_token = token;
        await user.save();
        try {
            mails = await googleService.getMail(user);
        } catch {

        }
    }

    if (storage == undefined) {
        return ({
            storage: mails.id,
            results: undefined
        });
     }
    if (storage != mails.id) {
        return {
            storage: mails.id,
            results: [
                mails.from,
                mails.subject,
                mails.message
            ]
        }
    }
    return (null);
}

// Google
async function action_google_new_video(user_id, storage, arg1)
{
    console.log("video youtube google");
    var user = await db.User.findById(user_id);
    var video;
    try {
        video = await googleService.getVideoYoutube(user, arg1);
    } catch {
        var token = await refreshTokenGoogle(user.google.refresh_token, user.google.origin);/// = get access token
        user.google.access_token = token;
        await user.save();
        try {
            video = await googleService.getVideoYoutube(user, arg1);
        } catch {

        }
    }

    if (storage == undefined) {
        return ({
            storage: video.videoTitle,
            results: undefined
        });
     }
    if (storage != video.videoTitle) {
        return {
            storage: video.videoTitle,
            results: [
                video.videoTitle,
                video.channelTitle,
                video.videoId
            ]
        }
    }
    return (null);
}

async function reaction_google_mail_send(user_id, email_adress, subject, body)
{
    console.log("send mail google");
    var user = await db.User.findById(user_id);
    
    try {
        await googleService.sendMail(user, subject, email_adress, body);
    } catch {
        var token = await refreshTokenGoogle(user.google.refresh_token, user.google.origin); // = get access token
        user.google.access_token = token;
        await user.save();
        try {
            await googleService.sendMail(user);
        } catch {

        }
    }

}

async function reaction_google_like_video(user_id, videoId)
{
    console.log("like video");
    var user = await db.User.findById(user_id);
    try {
        await googleService.likeYoutube(user, videoId);
    } catch {
        var token = await refreshTokenGoogle(user.google.refresh_token, user.google.origin); // = get access token
        user.google.access_token = token;
        await user.save();
        try {
            await googleService.likeYoutube(user, videoId);
        } catch {

        }
    }
}

async function reaction_google_dislike_video(user_id, videoId)
{
    console.log("dislike video");
    var user = await db.User.findById(user_id);
    try {
        await googleService.dislikeYoutube(user, videoId);
    }
    catch {
        var token = await refreshTokenGoogle(user.google.refresh_token, user.google.origin); // = get access token
        user.google.access_token = token;
        await user.save();
        try {
            await googleService.dislikeYoutube(user, videoId);
        } catch {
    
        }
    }
}

// Microsoft
async function action_microsoft_new_mail_received(user_id, storage)
{
    console.log("mail microsoft");
    var user = await db.User.findById(user_id);
    var mails;
    try {
        mails = await microsoftService.getOutlookMail(user);
    } catch {
        var token = await refreshTokenMicrosoft(user.microsoft.refresh_token, user.microsoft.origin);/// = get access token
        user.microsoft.access_token = token;
        await user.save();
        try {
            mails = await microsoftService.getOutlookMail(user);
        } catch {
            
        }
    }

    if (storage == undefined) {
       return ({
            storage: mails.id,
            results: undefined
        });
    }
    if (storage != mails.id) {
        return {
            storage: mails.id,
            results: [
                mails.from,
                mails.subject,
                mails.message
        ]
        }
    }
    return (null);
}

async function reaction_microsoft_create_todotask(user_id, taskname, tasklist)
{
    console.log("task microsoft");
    var user = await db.User.findById(user_id);
    try {
        await microsoftService.createTodoTask(user, taskname, tasklist);
    } catch {
        var token = await refreshTokenMicrosoft(user.microsoft.refresh_token, user.microsoft.origin);/// = get access token
        user.microsoft.access_token = token;
        await user.save();
        try {
            await microsoftService.createTodoTask(user, taskname, tasklist);
        } catch {
        
        }
    }
}

async function reaction_microsoft_send_mail(user_id, email_adress, subject, body)
{
    console.log("send mail microsoft");
    var user = await db.User.findById(user_id);
    try {
        await microsoftService.sendOutlookMail(user, subject, email_adress, body);
    } catch {
        var token = await refreshTokenMicrosoft(user.microsoft.refresh_token, user.microsoft.origin);/// = get access token
        user.microsoft.access_token = token;
        await user.save();
        try {
            await microsoftService.sendOutlookMail(user, subject, email_adress, body);
        } catch {

        }
    }
}

async function reaction_microsoft_create_event(user_id, subject, message, location, start, startTime, end, endTime, invited)
{
    console.log("create event microsoft");
    var user = await db.User.findById(user_id);
    var startDate = start + 'T' + startTime + ':00'
    var endDate = end + 'T' + endTime + ':00'
    var attendees = invited.split('$');
    try {
        await microsoftService.createOutlookEvent(user, subject, message, location, startDate, endDate, attendees);
    } catch {
        var token = await refreshTokenMicrosoft(user.microsoft.refresh_token, user.microsoft.origin);/// = get access token
        user.microsoft.access_token = token;
        await user.save();
        try {
            await microsoftService.createOutlookEvent(user, subject, message, location, startDate, endDate, attendees);
        } catch {

        }
    }
}

// Github
async function action_github_new_commit(user_id, storage, arg1)
{
    console.log("new commit");
    var user = await db.User.findById(user_id);
    var commit;
    
    try {
        commit = await githubService.getCommit(user, arg1);
    } catch {
        return ({storage:storage, result:undefined})
    }
    if (storage == undefined) {
       return ({
            storage: commit.id,
            results: undefined
        });
    }
    if (storage != commit.id) {
        return {
            storage: commit.id,
            results: [
                commit.id,
                commit.from,
                commit.message
            ]
        }
    }
    return (null);
}

// Twich
async function action_twitch_on_live(user_id, storage, arg1)
{
    console.log("on live Twitch");
    var user = await db.User.findById(user_id);
    var live;
    try {
        live = await twitchService.getOnLive(user, arg1);
    } catch {
        var token = await refreshTokenTwitch(user.twitch.refresh_token, user.twitch.origin); // = get access token
        user.twitch.access_token = token;
        await user.save();
        try {
            live = await twitchService.getOnLive(user, arg1);
        } catch {

        }
    }

    if (live == undefined)
        return (null);
    if (storage != live.status) {
        return {
            storage: live.status,
            results: [
                live.name,
                live.game
            ]
        }
    }
    return (null);
}

// Reddit
async function action_reddit_new_post(user_id, storage, arg1)
{
    console.log("new reddit post");
    var user = await db.User.findById(user_id);
    var post;
    try {
        post =  await redditService.getNewPost(user, arg1);
    } catch {
        var token = await refreshTokenReddit(user.reddit.refresh_token, user.reddit.origin)
        user.reddit.access_token = token;
        await user.save();
        try {
            post =  await redditService.getNewPost(user, arg1);
        } catch {

        }
    }

    if (storage == undefined) {
        return ({
             storage: post.id,
             results: undefined
         });
    }
    if (storage != post.id) {
        return {
            storage: post.id,
            results: [
                post.title,
                post.message,
            ]
        }
    }
    return (null);
}

async function action_reddit_news(user_id, storage, arg1)
{
    console.log("new reddit post subreddit");
    var user = await db.User.findById(user_id);
    var post;
    try {
        post = await redditService.getNews(user, arg1);
    } catch {
        var token = await refreshTokenReddit(user.reddit.refresh_token, user.reddit.origin)
        user.reddit.access_token = token;
        await user.save();
        try {
            post = await redditService.getNews(user, arg1);
        } catch {
            
        }
    }

    if (storage == undefined) {
        return ({
            storage: post.id,
            results: undefined
        });
    }
    if (storage != post.id) {
        return {
            storage: post.id,
            results: [
                post.title,
                post.message,
            ]
        }
    }
    return (null);
}

// Weather
async function action_weather_changed(user_id, storage, arg1)
{
    console.log("weather changed");
    var user = await db.User.findById(user_id);
    var weather;
    
    try {
        weather = await weatherService.getWeather(user, arg1);
    } catch {
        return ({storage:storage, result:undefined})
    }
    if (storage == undefined) {
        return ({
            storage: weather.state,
            results: undefined
        });
    }
    if (storage != weather.state) {
    return {
        storage: weather.state,
        results: [
            weather.state,
            weather.temp
            ]
        }
    }
    return (null);
}

// Maybe
async function action_yes_no(user_id, storage, arg1)
{
    console.log("maybe api");
    var user = await db.User.findById(user_id);
    var maybe;
    
    try {
        maybe = await maybeService.getMaybe(user);
    } catch {
        return ({storage:storage, result:undefined})
    }
    if (arg1 == maybe.answer) {
    return {
        storage: maybe.answer,
        results: [
            maybe.answer,
            maybe.image
            ]
        }
    }
    return (null);
}

async function action_yes_no_different(user_id, storage)
{
    console.log("maybe api");
    var user = await db.User.findById(user_id);
    var maybe;
    
    try {
        maybe = await maybeService.getMaybe(user);
    } catch {
        return ({storage:storage, result:undefined})
    }
    if (maybe == undefined)
        return (null);
    if (storage != maybe.answer) {
    return {
        storage: maybe.answer,
        results: [
            maybe.answer,
            maybe.image
        ]
        }
    }
    return (null);
}

async function action_yes_no_always(user_id, storage)
{
    console.log("maybe api");
    var user = await db.User.findById(user_id);
    var maybe;
    
    try {
        maybe = await maybeService.getMaybe(user);
    } catch {
        return ({storage:storage, result:undefined})
    }

    return {
        results: [
            maybe.answer,
            maybe.image
        ]
    }
}


function test_reaction_handler_function(user_id, arg1, arg2) {

}

module.exports = {
    dictionnary
}