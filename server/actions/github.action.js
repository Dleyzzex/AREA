const axios = require('axios');
const { ErrorHandler } = require('../helpers/error');
const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    getCommit
}

async function getCommit(user, repo)
{
    var config = {
        headers: {'Authorization': 'token ' + user.github.token}
    }
    var response;
    response = await axios.get('https://api.github.com/repos/' + user.github.username + '/' + repo + '/commits', config)
    var id = response.data[0].sha
    var from = response.data[0].commit.author.name
    var msg = response.data[0].commit.message
    return {
        id: id,
        from: from,
        message: msg
    }
}