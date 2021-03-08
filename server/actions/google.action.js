const axios = require('axios');
const { ErrorHandler } = require('../helpers/error');
const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    sendMail,
    getMail,
    getVideoYoutube,
    likeYoutube,
    dislikeYoutube
}

async function sendMail(user, object, receiver, message)
{
    var mail = new Buffer.from(
        "From: " + user.google.email +"\n" +
        "To: "+receiver+"\n" +
        "Subject: "+object+"\n\n" +
        message
    ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    var config = {
        headers: {
            'Authorization': "Bearer " + user.google.access_token,
            'Content-Type' : "application/json"
        }
    }
    var response = await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', JSON.stringify({ "raw": mail }), config)
}

async function getMail(user)
{
    var config = {
        headers: {
            'Authorization': "Bearer " + user.google.access_token,
            'Content-Type' : "application/json",
        }
    }

    var response= await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX', config);
    var id = response.data.messages[0].id
    var response2 = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+id, config)

    var from
    var msg
    var object
    for (h of response2.data.payload.headers) {
        if (h.name == "From")
            from = h.value
        if (h.name == "Subject")
            object = h.value
    }
    msg = response2.data.snippet
    return {
        id: id,
        from: from,
        message: msg,
        subject: object
    }
}

async function getVideoYoutube(user, channelId)
{
    var config = {
        headers: {
            'Authorization': "Bearer " + user.google.access_token,
            'Content-Type' : "application/json",
        }
    }
    var response = await axios.get('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + channelId +'&type=video&order=date', config);

    var videoTitle = response.data.items[0].snippet.title
    var channelTitle = response.data.items[0].snippet.channelTitle
    var videoId = response.data.items[0].id.videoId
    return {
        videoTitle: videoTitle,
        channelTitle: channelTitle,
        videoId: videoId
    }
}

async function likeYoutube(user, videoId)
{
    var config = {
        headers: {
            'Authorization': "Bearer " + user.google.access_token,
        }
    }
    var response = await axios.post('https://www.googleapis.com/youtube/v3/videos/rate?id='+videoId+'&rating=like', {}, config)
    return response
}

async function dislikeYoutube(user, videoId)
{
    var config = {
        headers: {
            'Authorization': "Bearer " + user.google.access_token,
        }
    }
    var response;
    try {
        response = await axios.post('https://www.googleapis.com/youtube/v3/videos/rate?id='+videoId+'&rating=dislike', {}, config)
    } catch(e) {
        //TODO: throw
        console.log(e)
    }
    return response
}