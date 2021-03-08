const axios = require('axios');

const { ErrorHandler } = require('../helpers/error');

const { USER_NOT_FOUND, UNLINK_ACCOUNT, LINK_ACCOUNT, INVALID_AUTH_CODE, MISSING_REFRESH_TOKEN } = require('../helpers/error-type');

module.exports = {
    getWeather
}

// ACTIONS
async function getWeather(user, city)
{
    var response;
    var res;
    var request = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric&appid=' + process.env.OPEN_WEATHER_CLIENT_ID;

    response = await axios.get(request);
    res = {
        temp: response.data.main.temp,
        state: response.data.weather[0].main,
    }
    return (res);
}