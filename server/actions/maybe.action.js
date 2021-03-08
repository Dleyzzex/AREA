const axios = require('axios');

const { ErrorHandler } = require('../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    getMaybe
}

// ACTIONS
async function getMaybe(user)
{
    var response;
    var res;
    var request = 'https://yesno.wtf/api'

    response = await axios.get(request);
    res = {
        answer: response.data.answer,
        image: response.data.image
    }
    return (res);
}
