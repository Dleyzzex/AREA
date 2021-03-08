const axios = require('axios');

const { ErrorHandler } = require('../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    sendOutlookMail,
    createOutlookEvent,
    createTodoTask,
    getOutlookMail
}

// REACTIONS

async function sendOutlookMail(user, object, receiver, message)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var config = {

        headers: {
            'Authorization': auth,
            'Content-type': 'application/json'
        },
    }
    const data = {
        subject: object,
        importance:"Normal",
        body:{
            contentType:"text",
            content: message
        },
        toRecipients:[
            {
                emailAddress:{
                    address: receiver
                }
            }
        ]
    };
    var response = await axios.post('https://graph.microsoft.com/v1.0/me/messages', data, config)

    sendDraft(user.microsoft.access_token, response.data.id);
    return;
}

async function sendDraft(access_token, object)
{
    var auth = 'Bearer ' + access_token;
    var request = 'https://graph.microsoft.com/v1.0/me/messages/' + object + '/send';

    var config = {
        method: 'post',
        url: request,
        headers: {
          'Authorization': auth,
          'Content-Length': '0'
        }
    };
    var response = await axios(config);
}

async function createOutlookEvent(user, subject, message, location, start, end, invited)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var request = "https://graph.microsoft.com/v1.0/me/calendar/events";

    var attendees = [ ];
    var tmp;
    for (var element in invited) {
        tmp = invited[element].split(':');
            attendees.push({"emailAddress": {"address":tmp[0], "name":tmp[1]}, "type":"required"});
    }
    var event = 
    {
        "subject": subject,
        "body": {
          "contentType": "text",
          "content": message
        },
        "start": {
            "dateTime": start,
            "timeZone": "Europe/Paris"
        },
        "end": {
            "dateTime": end,
            "timeZone": "Europe/Paris"
        },
        "location":{
            "displayName":location
        },
        "attendees": attendees
    };
    var config = {
        method: 'post',
        url: request,        
        headers: {
            'Authorization': auth,
            'Content-type': 'application/json',
        },
        data: event
    }
    var response= await axios(config);
    return;
}

async function createTodoTask(user, task, taskList)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var config = {

        headers: {
            'Authorization': auth,
            'Content-type': 'application/json'
        },
    }
    const data = {
        "title":task
    };
    var response;
    var exist = false;
    var idTaskList;
    var accoutTaskList = await getTaskList(user);

    for (let elem of accoutTaskList) {
        if (elem.displayName == taskList) {
            exist = true;
            idTaskList = elem.id;
        }
    }
    if (!exist)
        idTaskList = await createTodoList(user, taskList);
    response = await axios.post('https://graph.microsoft.com/v1.0/me/todo/lists/' + idTaskList + '/tasks', data, config)
    return;
}

async function createTodoList(user, taskList)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var config = {
        headers: {
            'Authorization': auth,
            'Content-type': 'application/json'
        }
    }
    var data = {
        "displayName": taskList
    };
    var response = await axios.post('https://graph.microsoft.com/v1.0/me/todo/lists', data, config)
    return (response.data.id);
}

// ACTIONS

async function getOutlookMail(user)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var request = 'https://graph.microsoft.com/v1.0/me/messages';

    var config = {
        method: 'get',
        url: request,
        headers: {
          'Authorization': auth
        }
    };
    var response = await axios(config);
    var res = await getMessage(user, response.data.value[0].id);
    return (res);
}

async function getMessage(user, id)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var request = 'https://graph.microsoft.com/v1.0/me/messages/' + id;

    var config = {
        method: 'get',
        url: request,
        headers: {
          'Authorization': auth,
          'Prefer': 'outlook.body-content-type="text"'
        }
    };
    var response = await axios(config);
  
    var from = "";
    var msg = "";
    var subject = "";
    
    if (response.data.from)
        from = response.data.from.emailAddress.address;
    if (response.data.body.content)
        msg = response.data.body.content;
    if (response.data.subject)
        subject = response.data.subject;
    var res = {
        id: id,
        from: from,
        message: msg,
        subject: subject
    }
    return (res);
}

async function getTaskList(user)
{
    var auth = 'Bearer ' + user.microsoft.access_token;
    var request = 'https://graph.microsoft.com/v1.0/me/todo/lists';

    var config = {
        method: 'get',
        url: request,
        headers: {
          'Authorization': auth
        }
    };
    var response = await axios(config);

    return (response.data.value);
}